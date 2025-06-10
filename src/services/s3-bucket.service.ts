import { S3 } from 'aws-sdk';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as mime from 'mime-types';
import { IFileUploadResponse } from 'src/types/types';
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
  private readonly R2_PUBLIC_URL = 'https://pub-f62e5f93f8cd4c6fa9584c4bd174c8ec.r2.dev';

  constructor(
    @InjectModel(Collections.files)
    private filesModel: Model<AttachmentInterface>,
  ) {}

  async setupAwsClient(): Promise<void> {
    try {
      if (this.s3Client === undefined) {
        this.s3Client = new S3({
          endpoint: this.R2_PUBLIC_URL,
          signatureVersion: 'v4',
          region: 'auto'
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
          'public',
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
        url: `${this.R2_PUBLIC_URL}/${bucketPayload.Key}`,
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
        Bucket: 'public',
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
        Bucket: 'public',
        Key: key,
      };

      const presignedUrl = await this.s3Client.getSignedUrlPromise(
        'getObject',
        {
          ...params,
          Expires: expiresIn,
        },
      );
      return presignedUrl;
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
}
