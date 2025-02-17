import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Collections } from 'src/constants';

export type PaymentDocument = Payments & Document;

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class Payments {
  @Prop({ required: true, ref: Collections.users, type: String })
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: null, required: true, type: String })
  paymentIntentId: string;

  @Prop({ default: null, required: true, type: String })
  amount: string;

  @Prop({ default: null, required: true, type: String })
  currency: string;

  @Prop({
    type: Object,
    required: true,
    default: null,
  })
  cardDetails: {
    brand: string;
    country: string;
    last_four_digits: string;
    exp_year: number;
    exp_month: number;
  };
}

export const PaymentsSchema = SchemaFactory.createForClass(Payments);
