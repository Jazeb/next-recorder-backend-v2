import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections, FileTypes } from 'src/constants';
import { AttachmentInterface } from 'src/interfaces/interfaces';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Collections.files)
    private fileModel: Model<AttachmentInterface>,
  ) {}

  async reportMediaItem(fileId: string) {
    try {
      return await this.fileModel.findOneAndUpdate(
        { _id: fileId },
        { isReported: true },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async getAllReportedMediaItems(
    page: number,
    pageSize: number,
    fileType: FileTypes,
  ): Promise<{ total: number; data: AttachmentInterface[] }> {
    try {
      const matchConditions: { fileType?: string; isReported: boolean } = {
        isReported: true,
      };
      if (fileType !== null) {
        matchConditions.fileType = fileType;
      }
      const result = await this.fileModel
        .aggregate([
          {
            $match: matchConditions,
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

  async getAllReportedMediaItemsCount(): Promise<{
    imageCount: number;
    videoCount: number;
    overallCount: number;
  }> {
    try {
      const result = await this.fileModel
        .aggregate([
          {
            $match: { isReported: true },
          },
          {
            $facet: {
              imageCount: [
                { $match: { fileType: 'image' } },
                { $count: 'count' },
              ],
              videoCount: [
                { $match: { fileType: 'video' } },
                { $count: 'count' },
              ],
              overallCount: [{ $count: 'count' }],
            },
          },
        ])
        .exec();

      return {
        imageCount: result[0].imageCount[0]?.count || 0,
        videoCount: result[0].videoCount[0]?.count || 0,
        overallCount: result[0].overallCount[0]?.count || 0,
      };
    } catch (error) {
      throw error;
    }
  }
}
