import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from 'src/services/folder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { FolderSchema } from 'src/schemas/folder.schema';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.folders, schema: FolderSchema },
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
