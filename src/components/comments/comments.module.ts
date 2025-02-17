import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from '../../services/comments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { CommentSchema } from 'src/schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.comments, schema: CommentSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
