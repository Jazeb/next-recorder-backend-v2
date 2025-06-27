import { S3 } from 'aws-sdk';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as mime from 'mime-types';
import { IFileUploadResponse, IInitMultipartUploadResponse, IGetPresignedUrlResponse, ICompleteMultipartUploadResponse } from 'src/types/types';
import { InjectModel } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { Model } from 'mongoose';
import { AttachmentInterface } from 'src/interfaces/interfaces';
import * as ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
ffmpeg.setFfprobePath('/opt/homebrew/bin/ffprobe');

@Injectable()
export class S3BucketService {
  private s3Client: S3;

  constructor(
    @InjectModel(Collections.files)
    private filesModel: Model<AttachmentInterface>,
  ) {}

  async setupAwsClient(): Promise<void> {
    try {
      if (this.s3Client === undefined) {
        const { AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET, AWS_REGION } = process.env;
        
        // Debug logging
        console.log('Environment variables check:', {
          AWS_ACCESS_KEY: AWS_ACCESS_KEY ? 'SET' : 'MISSING',
          AWS_SECRET_KEY: AWS_SECRET_KEY ? 'SET' : 'MISSING',
          S3_BUCKET: S3_BUCKET ? 'SET' : 'MISSING',
          AWS_REGION: AWS_REGION ? 'SET' : 'MISSING',
          AWS_REGION_VALUE: AWS_REGION,
        });
        
        if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY || !S3_BUCKET || !AWS_REGION) {
          throw new HttpException(
            'Missing required AWS environment variables to proceed.',
            HttpStatus.BAD_REQUEST,
          );
        }
        this.s3Client = new S3({
          accessKeyId: AWS_ACCESS_KEY,
          secretAccessKey: AWS_SECRET_KEY,
          region: AWS_REGION,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async uploadFile(
    files: Array<Express.Multer.File>,
    userId: string,
    folderId: string | null,
    directory: string,
  ): Promise<{ fileId: string; fileName: string; fileUrl: string }[]> {
    if (!Array.isArray(files) || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.setupAwsClient();

      const uploadPromises = files.map((file) => {
        const { originalname, buffer } = file;
        const fileMimeType =
          mime.lookup(originalname) || 'application/octet-stream';
        return this.uploadFileToS3(
          buffer,
          process.env.S3_BUCKET,
          originalname,
          fileMimeType,
          directory,
        );
      });
      const uploadedFiles = await Promise.all(uploadPromises);

      const attachmentPromises = files.map(async (file, index) => {
        const { originalname, mimetype, size, buffer } = file;
        const s3Response = uploadedFiles[index];

        let videoDuration: number | null = null;

        if (mimetype.startsWith('video')) {
          videoDuration = await this.getVideoDuration(buffer);
        }
        console.log('Video Duration:', videoDuration);

        return await this.filesModel.create({
          name: originalname,
          path: s3Response.Key,
          attachmentParentId: null,
          url: s3Response.url,
          fileType: mimetype.split('/')[0],
          size,
          userId,
          folderId,
          mimetype,
          videoDuration,
        });
      });

      const savedFiles = await Promise.all(attachmentPromises);
      return savedFiles.map((savedFile, index) => ({
        fileId: savedFile._id,
        fileName: files[index].originalname,
        fileUrl: uploadedFiles[index].url,
      }));
    } catch (error) {
      throw error;
    }
  }

  private async uploadFileToS3(
    file: Buffer,
    bucket: string,
    name: string,
    contentType: string,
    directory: string,
  ): Promise<IFileUploadResponse> {
    const timestamp = Date.now();
    const fileKey = `${directory}/${name.split('.').join(`-${timestamp}.`)}`;

    const params: S3.PutObjectRequest = {
      Bucket: bucket,
      Key: fileKey,
      Body: file,
      ContentType: contentType,
      ContentDisposition: 'inline',
    };

    try {
      const bucketPayload = await this.s3Client.upload(params).promise();
      return {
        ...bucketPayload,
        url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${bucketPayload.Key}`,
      } as IFileUploadResponse;
    } catch (error) {
      console.error(`Error uploading file ${name}:`, error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFileViaKey(key: string): Promise<S3.GetObjectOutput> {
    try {
      await this.setupAwsClient();
      const params: S3.GetObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
      };
      return await this.s3Client.getObject(params).promise();
    } catch (error) {
      console.error(`Error fetching file with key ${key}:`, error.message);
      throw new HttpException(
        'File not found or access denied',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      await this.setupAwsClient();
      const params: S3.GetObjectRequest = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
      };

      const presignedUrl = await this.s3Client.getSignedUrlPromise(
        'getObject',
        {
          ...params,
          Expires: expiresIn,
        },
      );
      return presignedUrl.replace('https://s3.amazonaws.com/', 'https://');
    } catch (error) {
      console.error(
        `Error generating presigned URL for key ${key}:`,
        error.message,
      );
      throw new HttpException(
        'Error generating presigned URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  bufferToStream(buffer: Buffer): PassThrough {
    const stream = new PassThrough();
    stream.end(buffer);
    return stream;
  }

  async getVideoDuration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      const stream = this.bufferToStream(buffer);
      ffmpeg(stream).ffprobe((err, data) => {
        if (err) {
          return reject(err);
        }
        const duration = data.format.duration;
        resolve(duration);
      });
    });
  }

  // S3 Multipart Upload Methods
  async initMultipartUpload(
    fileName: string,
    contentType: string,
    directory: string = 'uploads',
    userId: string,
    folderId?: string,
  ): Promise<IInitMultipartUploadResponse> {
    try {
      await this.setupAwsClient();

      const timestamp = Date.now();
      const fileKey = `${directory}/${fileName.split('.').join(`-${timestamp}.`)}`;

      const params: S3.CreateMultipartUploadRequest = {
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
        ContentType: contentType,
        Metadata: {
          userId,
          folderId: folderId || '',
          originalName: fileName,
        },
      };

      const result = await this.s3Client.createMultipartUpload(params).promise();

      return {
        uploadId: result.UploadId,
        key: fileKey,
        bucket: process.env.S3_BUCKET,
      };
    } catch (error) {
      console.error('Error initializing multipart upload:', error.message);
      throw new HttpException(
        'Failed to initialize multipart upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPresignedUrlForPart(
    uploadId: string,
    key: string,
    partNumber: number,
    expiresIn: number = 3600,
  ): Promise<IGetPresignedUrlResponse> {
    try {
      await this.setupAwsClient();

      const params: S3.UploadPartRequest = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      };

      console.log('Generating presigned URL with params:', JSON.stringify(params, null, 2));

      const presignedUrl = await this.s3Client.getSignedUrlPromise(
        'uploadPart',
        {
          ...params,
          Expires: expiresIn,
        },
      );

      console.log('Generated presigned URL successfully');

      return {
        presignedUrl,
        expiresIn,
      };
    } catch (error) {
      console.error('Error generating presigned URL for part:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
        uploadId,
        key,
        partNumber,
        bucket: process.env.S3_BUCKET,
        region: process.env.AWS_REGION,
      });
      
      throw new HttpException(
        `Failed to generate presigned URL for part: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async completeMultipartUpload(
    uploadId: string,
    key: string,
    parts: Array<{ ETag: string; PartNumber: number }>,
    fileName: string,
    contentType: string,
    fileSize: number,
    userId: string,
    folderId?: string,
  ): Promise<ICompleteMultipartUploadResponse> {
    try {
      await this.setupAwsClient();

      // Sort parts by part number
      const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

      const params: S3.CompleteMultipartUploadRequest = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sortedParts,
        },
      };

      console.log('Completing multipart upload with params:', JSON.stringify(params, null, 2));

      const result = await this.s3Client.completeMultipartUpload(params).promise();

      console.log('Multipart upload completed successfully:', result);

      // Create file record in database
      const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      const savedFile = await this.filesModel.create({
        name: fileName,
        path: key,
        attachmentParentId: null,
        url: fileUrl,
        fileType: contentType.split('/')[0],
        size: fileSize,
        userId,
        folderId,
        mimetype: contentType,
        videoDuration: null, // Will be updated if it's a video
      });

      // If it's a video, get the duration
      if (contentType.startsWith('video/')) {
        try {
          const videoDuration = await this.getVideoDurationFromS3(key);
          await this.filesModel.findByIdAndUpdate(savedFile._id, {
            videoDuration,
          });
        } catch (error) {
          console.error('Error getting video duration:', error.message);
        }
      }

      return {
        fileId: savedFile._id,
        fileName,
        fileUrl,
        key,
      };
    } catch (error) {
      console.error('Error completing multipart upload:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
        uploadId,
        key,
        partsCount: parts.length,
      });
      
      throw new HttpException(
        `Failed to complete multipart upload: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async abortMultipartUpload(uploadId: string, key: string): Promise<void> {
    try {
      await this.setupAwsClient();

      const params: S3.AbortMultipartUploadRequest = {
        Bucket: process.env.S3_BUCKET,
        Key: key,
        UploadId: uploadId,
      };

      await this.s3Client.abortMultipartUpload(params).promise();
    } catch (error) {
      console.error('Error aborting multipart upload:', error.message);
      throw new HttpException(
        'Failed to abort multipart upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getVideoDurationFromS3(key: string): Promise<number> {
    try {
      const fileObject = await this.getFileViaKey(key);
      if (fileObject.Body) {
        return await this.getVideoDuration(fileObject.Body as Buffer);
      }
      return 0;
    } catch (error) {
      console.error('Error getting video duration from S3:', error.message);
      return 0;
    }
  }
}