import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from '../../services/dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { PaymentsSchema } from 'src/schemas/payments.schema';
import { UserSchema } from 'src/schemas/users.schema';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.payments, schema: PaymentsSchema },
      { name: Collections.users, schema: UserSchema },
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
