import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlanTypes } from 'src/constants';

export type UserDocument = User & Document;

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
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: PlanTypes.FREE })
  planType: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: null })
  googleId: string;

  @Prop({ default: null })
  profilePicture: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  billingCardNumber: string;

  @Prop({ required: true })
  billingCardExpiry: string;

  @Prop({ required: true })
  billingCardCvc: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
