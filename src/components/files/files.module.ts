import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from 'src/services/files.service';
import { Collections } from 'src/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
