import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from '../../services/plans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { PlanSchema } from 'src/schemas/plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.plans, schema: PlanSchema },
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
