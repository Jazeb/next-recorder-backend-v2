import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import { SubscriptionService } from '../services/subscription.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Body() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = await this.stripeService.constructEventFromPayload(payload, signature);

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
      }

      return { received: true };
    } catch (error) {
      throw new HttpException(
        `Webhook Error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async handleSubscriptionCreated(subscription: any) {
    // Handle new subscription
    console.log('New subscription created:', subscription.id);
    // Update user's subscription status in your database
  }

  private async handleSubscriptionUpdated(subscription: any) {
    // Handle subscription update
    console.log('Subscription updated:', subscription.id);
    // Update user's subscription details in your database
  }

  private async handleSubscriptionDeleted(subscription: any) {
    // Handle subscription cancellation
    console.log('Subscription cancelled:', subscription.id);
    // Update user's subscription status in your database
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    // Handle successful payment
    console.log('Payment succeeded for invoice:', invoice.id);
    // Update payment status in your database
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);
    // Update payment status and notify user
  }
} 