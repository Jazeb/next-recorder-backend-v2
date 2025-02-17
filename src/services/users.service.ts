import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/constants';
import {
  AttachmentInterface,
  FolderInterface,
  UserInterface,
} from 'src/interfaces/interfaces';

@Injectable()
export class UsersService {
  constructor() {}
  @InjectModel(Collections.users) private userModel: Model<UserInterface>;
  @InjectModel(Collections.folders)
  private readonly foldersModel: Model<FolderInterface>;
  @InjectModel(Collections.files)
  private readonly filesModel: Model<AttachmentInterface>;

  async findAll(
    page: number,
    pageSize: number,
  ): Promise<{ total: number; data: UserInterface[] }> {
    try {
      const result = await this.userModel
        .aggregate([
          {
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                {
                  $lookup: {
                    from: 'files',
                    let: { userId: { $toString: '$_id' } },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$userId', '$$userId'],
                          },
                        },
                      },
                    ],
                    as: 'userFiles',
                  },
                },
                {
                  $addFields: {
                    videoCount: {
                      $size: {
                        $filter: {
                          input: '$userFiles',
                          as: 'file',
                          cond: { $eq: ['$$file.fileType', 'video'] },
                        },
                      },
                    },
                    imageCount: {
                      $size: {
                        $filter: {
                          input: '$userFiles',
                          as: 'file',
                          cond: { $eq: ['$$file.fileType', 'image'] },
                        },
                      },
                    },
                    status: {
                      $cond: {
                        if: { $eq: ['$isActive', true] },
                        then: 'active',
                        else: 'disabled',
                      },
                    },
                    billingCardNumber: '0234567890123456',
                    billingCardExpiry: '12/24',
                    billed: 'Annualy',
                  },
                },
                {
                  $project: {
                    _id: 0,
                    name: 1,
                    videoCount: 1,
                    imageCount: 1,
                    email: 1,
                    status: 1,
                    planType: 1,
                    profilePicture: 1,
                    billed: 1,
                    billingCardNumber: 1,
                    billingCardExpiry: 1,
                    id: '$_id',
                    memberSince: '$createdAt',
                    memberShip: '$planType',
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

  async create(user: UserInterface): Promise<UserInterface> {
    try {
      return await new this.userModel(user).save();
    } catch (error) {
      throw error;
    }
  }

  async findOneById(id: string): Promise<UserInterface> {
    try {
      return await this.userModel.findById({ _id: id, isActive: true }).exec();
    } catch (error) {
      throw error;
    }
  }

  async getFoldersFilesForDashboard(
    userId: string,
  ): Promise<{ folders: FolderInterface[]; files: AttachmentInterface[] }> {
    try {
      const [folders, files] = await Promise.all([
        this.foldersModel
          .find({ userId, isActive: true, parentId: null })
          .exec(),
        this.filesModel.find({ userId, isActive: true, folderId: null }).exec(),
      ]);
      return { folders, files };
    } catch (error) {
      console.error('Error fetching folders and files:', error);
      throw error;
    }
  }
}
