import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../../services/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/users.schema';
import { Collections } from 'src/constants';
import { FolderSchema } from 'src/schemas/folder.schema';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.users, schema: UserSchema },
      { name: Collections.folders, schema: FolderSchema },
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
