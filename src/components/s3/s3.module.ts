import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Controller } from 'src/controllers/s3.controller';
import { S3BucketService } from 'src/services/s3-bucket.service';
import { Collections } from 'src/constants';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [S3Controller],
  providers: [S3BucketService],
  exports: [S3BucketService],
})
export class S3Module {} 