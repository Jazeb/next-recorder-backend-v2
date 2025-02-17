import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections, PlanTypes } from 'src/constants';
import {
  AttachmentInterface,
  PaymentsInterface,
  UserInterface,
} from 'src/interfaces/interfaces';

@Injectable()
export class DashboardService {
  constructor() {}
  @InjectModel(Collections.payments)
  private paymentsModel: Model<PaymentsInterface>;
  @InjectModel(Collections.users)
  private usersModel: Model<UserInterface>;
  @InjectModel(Collections.files)
  private attachmentsModel: Model<AttachmentInterface>;

  async getOverallRevenueStats(): Promise<{
    thisYear: number;
    thisMonth: number;
    thisWeek: number;
    overall: number;
    currency?: string;
  }> {
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      );
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const pipeline = [
        {
          $facet: {
            thisYear: [
              { $match: { createdAt: { $gte: startOfYear } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: { $toDouble: '$amount' } },
                },
              },
            ],
            thisMonth: [
              { $match: { createdAt: { $gte: startOfMonth } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: { $toDouble: '$amount' } },
                },
              },
            ],
            thisWeek: [
              { $match: { createdAt: { $gte: startOfWeek } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: { $toDouble: '$amount' } },
                },
              },
            ],
            overall: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: { $toDouble: '$amount' } },
                },
              },
            ],
          },
        },
      ];

      const stats = await this.paymentsModel.aggregate(pipeline).exec();

      return {
        thisYear: stats[0]?.thisYear[0]?.totalRevenue || 0,
        thisMonth: stats[0]?.thisMonth[0]?.totalRevenue || 0,
        thisWeek: stats[0]?.thisWeek[0]?.totalRevenue || 0,
        overall: stats[0]?.overall[0]?.totalRevenue || 0,
        currency: 'USD',
      };
    } catch (error) {
      throw error;
    }
  }

  async getOverallUsersStats(): Promise<{
    totalUsers: number;
    premiumUsers: number;
    freeUsers: number;
    nonActiveUsers: number;
    reportsCount?: number;
  }> {
    try {
      const stats = await this.usersModel.aggregate([
        {
          $facet: {
            totalUsers: [{ $match: { isActive: true } }, { $count: 'total' }],
            premiumUsers: [
              { $match: { planType: PlanTypes.PREMIUM } },
              { $count: 'total' },
            ],
            freeUsers: [
              { $match: { planType: PlanTypes.FREE } },
              { $count: 'total' },
            ],
            nonActiveUsers: [
              { $match: { isActive: false } },
              { $count: 'total' },
            ],
          },
        },
        {
          $project: {
            totalUsers: { $arrayElemAt: ['$totalUsers.total', 0] },
            premiumUsers: { $arrayElemAt: ['$premiumUsers.total', 0] },
            freeUsers: { $arrayElemAt: ['$freeUsers.total', 0] },
            nonActiveUsers: { $arrayElemAt: ['$nonActiveUsers.total', 0] },
          },
        },
      ]);

      const result = stats[0] || {};
      const reportsCount = await this.attachmentsModel
        .find({ isReported: true })
        .countDocuments();
      return {
        totalUsers: result.totalUsers || 0,
        premiumUsers: result.premiumUsers || 0,
        freeUsers: result.freeUsers || 0,
        nonActiveUsers: result.nonActiveUsers || 0,
        reportsCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMediaStatsForYear(): Promise<
    { month: string; images: number; videos: number }[]
  > {
    try {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear + 1, 0, 1);

      const stats = await this.attachmentsModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear, $lt: endOfYear },
            isActive: true,
          },
        },
        {
          $project: {
            fileType: 1,
            createdAt: 1,
          },
        },
        {
          $addFields: {
            month: { $month: '$createdAt' },
            fileType: '$fileType',
          },
        },
        {
          $group: {
            _id: { month: '$month', fileType: '$fileType' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.month': 1, '_id.fileType': 1 },
        },
        {
          $group: {
            _id: '$_id.month',
            images: {
              $sum: {
                $cond: [{ $eq: ['$_id.fileType', 'image'] }, '$count', 0],
              },
            },
            videos: {
              $sum: {
                $cond: [{ $eq: ['$_id.fileType', 'video'] }, '$count', 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            images: 1,
            videos: 1,
          },
        },
      ]);
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const allMonthsStats = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        images: 0,
        videos: 0,
      }));

      const result = stats.reduce((acc, stat) => {
        const monthIndex = stat.month - 1;
        acc[monthIndex] = {
          month: monthNames[stat.month - 1],
          images: stat.images || 0,
          videos: stat.videos || 0,
        };
        return acc;
      }, allMonthsStats);

      return result;
    } catch (error) {
      throw error;
    }
  }
}
