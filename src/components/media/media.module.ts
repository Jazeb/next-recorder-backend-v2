import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { S3BucketService } from 'src/services/s3-bucket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [S3BucketService],
})
export class MediaModule {}
