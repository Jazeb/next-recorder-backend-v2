import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/constants';
import { CreateNewComment } from 'src/dtos/dto';
import { CommentInterface } from 'src/interfaces/interfaces';
import { SignedInUserType } from 'src/types/types';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Collections.comments)
    private commentModel: Model<CommentInterface>,
  ) {}
  async allComments(
    page: number,
    pageSize: number,
  ): Promise<CommentInterface[]> {
    try {
      return await this.commentModel
        .find({ isActive: true })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async getCommentsByPostId(
    attachmentId: string,
    page: number,
    pageSize: number,
    userId: string,
  ): Promise<CommentInterface[]> {
    try {
      return await this.commentModel
        .find({ attachmentId, userId, isActive: true })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async createComment(
    payload: CreateNewComment,
    user: SignedInUserType,
  ): Promise<CommentInterface> {
    try {
      const { userId, userName } = user;
      return await new this.commentModel({
        ...payload,
        userId,
        userName,
      }).save();
    } catch (error) {
      throw error;
    }
  }
}
