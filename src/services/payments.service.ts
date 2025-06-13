import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/constants';
import { PaymentsInterface, UserInterface } from 'src/interfaces/interfaces';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionService: SubscriptionService,
    @InjectModel(Collections.payments)
    private paymentsModel: Model<PaymentsInterface>,
    @InjectModel(Collections.users)
    private usersModel: Model<UserInterface>,
  ) {}

  async createSubscription(userId: string, plan: 'BASIC' | 'STANDARD' | 'PROFESSIONAL') {
    try {
      const user = await this.usersModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const subscription = await this.subscriptionService.createSubscription(
        user.stripeCustomerId,
        plan
      );

      await this.paymentsModel.create({
        userId,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        plan,
        status: subscription.status,
currentPeriodEnd: new Date((subscription as any)['current_period_end'] * 1000)      });

      return subscription;
    } catch (error) {
      throw new HttpException(
        `Subscription creation failed: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async handleWebhookEvent(payload: Buffer, signature: string) {
    try {
      const event = await this.stripeService.constructEventFromPayload(
        payload,
        signature
      );

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.updateSubscriptionStatus(event.data.object as Stripe.Subscription);
          break;
      }

      return { received: true };
    } catch (error) {
      throw new HttpException(
        `Webhook handling failed: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async updateSubscriptionStatus(subscription: Stripe.Subscription) {
    await this.paymentsModel.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any)['current_period_end'] * 1000)
      }
    );
  }
}
