import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CardDetailsDto } from 'src/dtos/dto';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true, enum: ['BASIC', 'STANDARD', 'PROFESSIONAL'] })
  plan: string;

  @Prop({ required: true, enum: ['active', 'canceled', 'past_due', 'unpaid'] })
  status: string;

  @Prop()
  currentPeriodEnd: Date;

  @Prop({ required: true })
  paymentIntentId: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ type: Object, required: true })
  cardDetails: CardDetailsDto;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment); 