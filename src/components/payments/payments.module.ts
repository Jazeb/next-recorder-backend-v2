import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { PaymentsSchema } from 'src/schemas/payments.schema';
import { PaymentsService } from 'src/services/payments.service';
import { UserSchema } from 'src/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.payments, schema: PaymentsSchema },
      { name: Collections.users, schema: UserSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
