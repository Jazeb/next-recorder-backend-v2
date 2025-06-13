import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-05-28.basil',
    });
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
      });
    } catch (error) {
      throw new HttpException(
        `Error creating customer: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      throw new HttpException(
        `Error attaching payment method: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      throw new HttpException(
        `Error creating subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'items.data.price.product'],
      });
    } catch (error) {
      throw new HttpException(
        `Error retrieving subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      throw new HttpException(
        `Error canceling subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateSubscription(
    subscriptionId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscriptionId,
          price: priceId,
        }],
      });
    } catch (error) {
      throw new HttpException(
        `Error updating subscription: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async constructEventFromPayload(payload: Buffer, signature: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (error) {
      throw new HttpException(
        `Webhook Error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 