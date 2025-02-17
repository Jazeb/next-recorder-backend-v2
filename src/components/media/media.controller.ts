import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as path from 'path';
import { SignedInUser } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { S3BucketService } from 'src/services/s3-bucket.service';
import { IAuthTokenResponse } from 'src/types/types';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly s3Service: S3BucketService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        'files[]': {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @SignedInUser() { userId }: IAuthTokenResponse,
    @Query('folderId') folderId: string,
  ): Promise<{ fileId: string; fileName: string; fileUrl: string }[]> {
    try {
      console.log(files);
      if (!Array.isArray(files) || !files.length) {
        throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
      }

      let allFilesAreValid = files.every((file: Express.Multer.File) =>
        process.env.WHITELISTED_EXTENSIONS.includes(
          path.extname(file.originalname.toLowerCase()),
        ),
      );
      if (!allFilesAreValid) {
        throw new HttpException(
          'File type not allowed',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.s3Service.uploadFile(
        files,
        userId,
        folderId || null,
        process.env.PUBLIC_DIRECTORY,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('/:key')
  async getFileViaKey(@Param('key') key: string) {
    try {
      return await this.s3Service.getFileViaKey(key);
    } catch (error) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('presigned-url/:key')
  async getPresignedUrl(@Param('key') key: string) {
    try {
      return await this.s3Service.getPresignedUrl(key);
    } catch (error) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
  }
}
