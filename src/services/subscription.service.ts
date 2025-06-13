import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  private readonly subscriptionTiers = {
    BASIC: {
      name: 'Basic',
      priceId: this.configService.get('STRIPE_BASIC_PRICE_ID'),
      features: [
        'Basic Recording',
        '5GB Storage',
        '720p Quality'
      ],
    },
    STANDARD: {
      name: 'Standard',
      priceId: this.configService.get('STRIPE_STANDARD_PRICE_ID'),
      features: [
        'Advanced Recording',
        '20GB Storage',
        '1080p Quality',
        'Priority Support'
      ],
    },
    PROFESSIONAL: {
      name: 'Professional',
      priceId: this.configService.get('STRIPE_PROFESSIONAL_PRICE_ID'),
      features: [
        'Unlimited Recording',
        '100GB Storage',
        '4K Quality',
        '24/7 Support',
        'Custom Branding'
      ],
    },
  };

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  async createSubscription(customerId: string, tier: 'BASIC' | 'STANDARD' | 'PROFESSIONAL') {
    const tierConfig = this.subscriptionTiers[tier];
    if (!tierConfig) {
      throw new Error('Invalid subscription tier');
    }

    return await this.stripeService.createSubscription(customerId, tierConfig.priceId);
  }

  async getSubscriptionDetails(subscriptionId: string) {
    return await this.stripeService.getSubscription(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string) {
    return await this.stripeService.cancelSubscription(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, newTier: 'BASIC' | 'STANDARD' | 'PROFESSIONAL') {
    const tierConfig = this.subscriptionTiers[newTier];
    if (!tierConfig) {
      throw new Error('Invalid subscription tier');
    }

    return await this.stripeService.updateSubscription(subscriptionId, tierConfig.priceId);
  }
} 