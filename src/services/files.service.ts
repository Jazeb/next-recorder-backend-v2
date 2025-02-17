import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections, FileTypes } from 'src/constants';
import { MoveMediaItemDto } from 'src/dtos/dto';
import { AttachmentInterface } from 'src/interfaces/interfaces';
import { Types } from 'mongoose';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(Collections.files)
    private fileModel: Model<AttachmentInterface>,
  ) {}

  async getAllFiles(
    page: number,
    pageSize: number,
  ): Promise<AttachmentInterface[]> {
    try {
      return await this.fileModel
        .find({ isActive: true })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async getFileDetails(fileId: string): Promise<AttachmentInterface> {
    try {
      console.log('fileId', fileId);
      const fileDetails = await this.fileModel
        .aggregate([
          {
            $match: {
              _id: new Types.ObjectId(fileId),
              isActive: true,
            },
          },
          {
            $lookup: {
              from: 'comments',
              let: { fileId: { $toString: '$_id' } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$attachmentId', '$$fileId'],
                    },
                  },
                },
              ],
              as: 'comments',
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { userIdStr: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', { $toObjectId: '$$userIdStr' }],
                    },
                  },
                },
              ],
              as: 'user',
            },
          },
          {
            $addFields: {
              user: { $arrayElemAt: ['$user', 0] },
              thumbnail: {
                $cond: {
                  if: { $eq: ['$fileType', FileTypes.VIDEO] },
                  then: '/assets/images/video.jpg',
                  else: null,
                },
              },
            },
          },
          {
            $project: {
              id: '$_id',
              _id: 0,
              name: 1,
              path: 1,
              size: 1,
              url: 1,
              folderId: 1,
              fileType: 1,
              videoDuration: 1,
              isBlocked: 1,
              createdAt: 1,
              thumbnail: 1,
              user: {
                name: 1,
                email: 1,
              },
              comments: {
                $cond: {
                  if: { $gt: [{ $size: '$comments' }, 0] },
                  then: {
                    $map: {
                      input: '$comments',
                      as: 'comment',
                      in: {
                        id: '$$comment._id',
                        comment: '$$comment.comment',
                        createdAt: '$$comment.createdAt',
                        userId: '$$comment.userId',
                        userName: '$$comment.userName',
                        attachmentId: '$$comment.attachmentId',
                      },
                    },
                  },
                  else: [],
                },
              },
            },
          },
        ])
        .exec();

      if (!fileDetails || fileDetails.length === 0) {
        throw new NotFoundException('File not found');
      }

      return fileDetails[0];
    } catch (error) {
      throw error;
    }
  }

  async moveFile(
    userId: string,
    fileId: string,
    moveItemDto: MoveMediaItemDto,
  ): Promise<AttachmentInterface> {
    try {
      const { newparentFolderId: folderId } = moveItemDto;
      const file = await this.fileModel.findOneAndUpdate(
        { _id: fileId, userId },
        { folderId },
        { new: true },
      );
      if (!file) {
        throw new NotFoundException('File not found');
      }
      return file;
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(userId: string, fileId: string): Promise<void> {
    try {
      const file = await this.fileModel.findOneAndUpdate(
        { _id: fileId, userId },
        { isActive: false },
        { new: true },
      );
      if (!file) {
        throw new NotFoundException('File not found');
      }
    } catch (error) {
      throw error;
    }
  }

  async getFilesByFolderId(
    userId: string,
    folderId: string,
  ): Promise<AttachmentInterface[]> {
    try {
      return await this.fileModel
        .find({ userId, folderId, isActive: true })
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async getAllFileDetails(
    page: number,
    pageSize: number,
    fileType: FileTypes,
  ): Promise<{ total: number; data: AttachmentInterface[] }> {
    try {
      const result = await this.fileModel
        .aggregate([
          {
            $match: {
              fileType,
            },
          },
          {
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                {
                  $lookup: {
                    from: 'comments',
                    let: { fileId: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$attachmentId', '$$fileId'],
                          },
                        },
                      },
                      {
                        $count: 'commentCount',
                      },
                    ],
                    as: 'comments',
                  },
                },
                {
                  $addFields: {
                    commentCount: {
                      $cond: {
                        if: { $gt: [{ $size: '$comments' }, 0] },
                        then: { $arrayElemAt: ['$comments.commentCount', 0] },
                        else: 0,
                      },
                    },
                  },
                },
                {
                  $unset: 'comments',
                },
                {
                  $lookup: {
                    from: 'users',
                    let: { userIdStr: '$userId' },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$_id', { $toObjectId: '$$userIdStr' }],
                          },
                        },
                      },
                    ],
                    as: 'user',
                  },
                },
                {
                  $addFields: {
                    user: { $arrayElemAt: ['$user', 0] },
                    reactionCount: 15,
                    viewsCount: 21,
                    videoDuration: {
                      $cond: {
                        if: { $eq: ['$fileType', FileTypes.VIDEO] },
                        then: '$videoDuration',
                        else: null,
                      },
                    },
                    thumbnail: {
                      $cond: {
                        if: { $eq: ['$fileType', FileTypes.VIDEO] },
                        then: '/assets/images/video.jpg',
                        else: null,
                      },
                    },
                  },
                },
                {
                  $sort: { createdAt: -1 },
                },
                {
                  $skip: pageSize * (page - 1),
                },
                {
                  $limit: pageSize,
                },
                {
                  $project: {
                    id: '$_id',
                    _id: 0,
                    fileType: 1,
                    commentCount: 1,
                    createdAt: 1,
                    size: 1,
                    name: 1,
                    path: 1,
                    url: 1,
                    folderId: 1,
                    videoDuration: 1,
                    isBlocked: 1,
                    user: {
                      name: 1,
                      email: 1,
                    },
                    reactionCount: 1,
                    viewsCount: 1,
                    thumbnail: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              total: { $arrayElemAt: ['$metadata.total', 0] },
            },
          },
        ])
        .exec();

      const total = result[0]?.total ?? 0;
      const data = result[0]?.data ?? [];

      return { total, data };
    } catch (error) {
      throw error;
    }
  }

  async updateFileName(fileId: string, payload: { name: string }) {
    try {
      const { name } = payload;
      return await this.fileModel.findOneAndUpdate(
        { _id: fileId },
        { name: name },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async getLastFourMediaItems(userId: string): Promise<AttachmentInterface[]> {
    try {
      return await this.fileModel
        .find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async getItemDetailsWithComments(
    fileId: string,
  ): Promise<{ itemDetail: any; comments: any }> {
    try {
      console.log('fileId', fileId);
      const fileDetails = await this.fileModel
        .aggregate([
          {
            $match: {
              _id: new Types.ObjectId(fileId),
              isActive: true,
            },
          },
          {
            $lookup: {
              from: 'comments',
              let: { fileId: { $toString: '$_id' } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$attachmentId', '$$fileId'],
                    },
                  },
                },
              ],
              as: 'comments',
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { userIdStr: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', { $toObjectId: '$$userIdStr' }],
                    },
                  },
                },
              ],
              as: 'user',
            },
          },
          {
            $addFields: {
              user: { $arrayElemAt: ['$user', 0] },
              thumbnail: {
                $cond: {
                  if: {
                    $in: ['$fileType', [FileTypes.VIDEO, FileTypes.IMAGE]],
                  },
                  then: '/assets/images/thumbnail.jpg', // Replace with appropriate path
                  else: null,
                },
              },
            },
          },
          {
            $project: {
              id: '$_id',
              _id: 0,
              name: 1,
              path: 1,
              size: 1,
              url: 1,
              folderId: 1,
              fileType: 1,
              videoDuration: 1,
              isBlocked: 1,
              createdAt: 1,
              thumbnail: 1,
              user: {
                name: 1,
                email: 1,
                profilePic: 1,
                id: '$_id',
              },
              comments: {
                $cond: {
                  if: { $gt: [{ $size: '$comments' }, 0] },
                  then: {
                    $map: {
                      input: '$comments',
                      as: 'comment',
                      in: {
                        id: '$$comment._id',
                        comment: '$$comment.comment',
                        createdAt: '$$comment.createdAt',
                        userId: '$$comment.userId',
                        userName: '$$comment.userName',
                        profilePic: '$$comment.profilePic',
                      },
                    },
                  },
                  else: [],
                },
              },
            },
          },
        ])
        .exec();

      if (!fileDetails || fileDetails.length === 0) {
        throw new NotFoundException('File not found');
      }

      const file = fileDetails[0];

      const itemDetail = {
        itemId: file.id,
        folderID: file.folderId,
        title: file.name,
        itemType: file.fileType,
        createdAt: file.createdAt,
        thumbnailURI: file.thumbnail || '',
        videoURI: file.fileType === FileTypes.VIDEO ? file.url : undefined,
        durationSecond: file.videoDuration || '',
        hasComment: file.comments.length > 0,
        userAvatar: file.user?.profilePic || '',
        userID: file.user?.id || 0,
        userName: file.user?.name || '',
        shareableKey: '',
        shareableUrl: file.url,
      };

      const comments = file.comments.map((comment: any) => ({
        commentId: comment.id,
        userId: comment.userId,
        userName: comment.userName,
        profilePic: comment.profilePic || '',
        description: comment.comment,
        reactions: [],
        commentAtTime: comment.createdAt,
      }));

      return { itemDetail, comments };
    } catch (error) {
      throw error;
    }
  }

  async searchFilesByName(searchTerm: string): Promise<AttachmentInterface[]> {
    try {
      const files = await this.fileModel
        .aggregate([
          {
            $match: {
              name: { $regex: searchTerm, $options: 'i' },
              isActive: true,
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { userIdStr: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', { $toObjectId: '$$userIdStr' }],
                    },
                  },
                },
              ],
              as: 'user',
            },
          },
          {
            $addFields: {
              user: { $arrayElemAt: ['$user', 0] },
            },
          },
          {
            $project: {
              id: '$_id',
              _id: 0,
              name: 1,
              path: 1,
              size: 1,
              fileType: 1,
              createdAt: 1,
              user: {
                name: 1,
                email: 1,
              },
            },
          },
        ])
        .exec();

      if (!files || files.length === 0) {
        throw new NotFoundException('No files found');
      }

      return files;
    } catch (error) {
      throw error;
    }
  }
}
