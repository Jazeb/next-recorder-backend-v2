import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignedInUser } from 'src/decorators/user.decorator';
import {
  InitMultipartUploadDto,
  GetPresignedUrlDto,
  CompleteMultipartUploadDto,
} from 'src/dtos/dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { S3BucketService } from 'src/services/s3-bucket.service';
import {
  IInitMultipartUploadResponse,
  IGetPresignedUrlResponse,
  ICompleteMultipartUploadResponse,
  IAuthTokenResponse,
} from 'src/types/types';

@ApiTags('S3 Multipart Upload')
@Controller('s3')
@ApiBearerAuth()
export class S3Controller {
  constructor(private readonly s3BucketService: S3BucketService) {}

  @UseGuards(JwtAuthGuard)
  @Post('init-upload')
  @HttpCode(HttpStatus.CREATED)
  async initMultipartUpload(
    @Body() initDto: InitMultipartUploadDto,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<IInitMultipartUploadResponse> {
    try {
      return await this.s3BucketService.initMultipartUpload(
        initDto.fileName,
        initDto.contentType,
        initDto.directory || 'uploads',
        userId,
        initDto.folderId,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('presign-url')
  @HttpCode(HttpStatus.OK)
  async getPresignedUrl(
    @Body() presignDto: GetPresignedUrlDto,
  ): Promise<IGetPresignedUrlResponse> {
    try {
      return await this.s3BucketService.getPresignedUrlForPart(
        presignDto.uploadId,
        presignDto.key,
        presignDto.partNumber,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-upload')
  @HttpCode(HttpStatus.OK)
  async completeMultipartUpload(
    @Body() completeDto: CompleteMultipartUploadDto,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<ICompleteMultipartUploadResponse> {
    try {
      return await this.s3BucketService.completeMultipartUpload(
        completeDto.uploadId,
        completeDto.key,
        completeDto.parts,
        completeDto.fileName,
        completeDto.contentType,
        completeDto.fileSize,
        userId,
        completeDto.folderId,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('abort-upload')
  @HttpCode(HttpStatus.NO_CONTENT)
  async abortMultipartUpload(
    @Body() abortDto: { uploadId: string; key: string },
  ): Promise<void> {
    try {
      await this.s3BucketService.abortMultipartUpload(
        abortDto.uploadId,
        abortDto.key,
      );
    } catch (error) {
      throw error;
    }
  }
} 