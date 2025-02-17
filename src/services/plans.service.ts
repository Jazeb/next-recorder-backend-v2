import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/constants';
import { CreateNewPlanDto } from 'src/dtos/dto';
import { PlanInterface } from 'src/interfaces/interfaces';

@Injectable()
export class PlansService {
  @InjectModel(Collections.plans) private plansModel: Model<PlanInterface>;

  async getPlanById(id: string): Promise<PlanInterface> {
    try {
      const data = await this.plansModel
        .findById({ _id: id, isActive: true })
        .exec();
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAllPlans(page: number, pageSize: number): Promise<PlanInterface[]> {
    try {
      return await this.plansModel
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async createNewPlan(
    data: CreateNewPlanDto,
    userId: string,
  ): Promise<PlanInterface> {
    try {
      return await new this.plansModel({ ...data, createdBy: userId }).save();
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: PlanInterface): Promise<PlanInterface> {
    try {
      return await this.plansModel
        .findByIdAndUpdate({ _id: id }, data, { new: true })
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async deletePlan(id: string): Promise<PlanInterface> {
    try {
      return await this.plansModel
        .findByIdAndUpdate({ _id: id }, { isActive: false })
        .exec();
    } catch (error) {
      throw error;
    }
  }
}
