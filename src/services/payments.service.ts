import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections, PlanTypes } from 'src/constants';
import { CreatePaymentDto } from 'src/dtos/dto';
import { PaymentsInterface, UserInterface } from 'src/interfaces/interfaces';

@Injectable()
export class PaymentsService {
  constructor() {}
  @InjectModel(Collections.payments)
  private paymentsModel: Model<PaymentsInterface>;
  @InjectModel(Collections.users)
  private usersModel: Model<UserInterface>;

  async createPaymentRecord(
    payload: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentsInterface> {
    try {
      await this.usersModel.findOneAndUpdate(
        { _id: userId },
        { $set: { planType: PlanTypes.PREMIUM } },
      );
      return await new this.paymentsModel({ ...payload, userId }).save();
    } catch (error) {
      throw error;
    }
  }
}
