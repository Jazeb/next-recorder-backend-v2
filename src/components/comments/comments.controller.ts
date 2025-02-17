import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignedInUser } from 'src/decorators/user.decorator';
import { CreateNewComment } from 'src/dtos/dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { CommentInterface } from 'src/interfaces/interfaces';
import { CommentsService } from 'src/services/comments.service';
import { IAuthTokenResponse, SignedInUserType } from 'src/types/types';

@ApiTags('Comments')
@Controller('comments')
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('all')
  async allComments(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<CommentInterface[]> {
    try {
      return await this.commentsService.allComments(page, pageSize);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':attachmentId')
  async getCommentsByPostId(
    @Param('attachmentId') attachmentId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<CommentInterface[]> {
    try {
      return await this.commentsService.getCommentsByPostId(
        attachmentId,
        page,
        pageSize,
        userId,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createComment(
    @Body() payload: CreateNewComment,
    @SignedInUser() user: SignedInUserType,
  ): Promise<CommentInterface> {
    try {
      return await this.commentsService.createComment(payload, user);
    } catch (error) {
      throw error;
    }
  }
}
