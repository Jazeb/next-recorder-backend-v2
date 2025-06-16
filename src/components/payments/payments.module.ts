import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from 'src/services/payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { PaymentSchema } from '../../schemas/payment.schema';
import { UserSchema } from 'src/schemas/users.schema';
import { StripeService } from 'src/services/stripe.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from 'src/services/subscription.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.payments, schema: PaymentSchema },
      { name: Collections.users, schema: UserSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService ,SubscriptionService, ConfigService],
})
export class PaymentsModule {}
