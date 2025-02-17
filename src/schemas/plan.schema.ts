import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PlanDocument = Plan & Document;

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
export class Plan {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
    validate: {
      validator: (value: any) => {
        return typeof value === 'number' || value === 'unlimited';
      },
      message: (props) =>
        `${props.value} is not a valid value. It must be a number or 'unlimited'.`,
    },
  })
  imageFilesLimit: string | number;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
    validate: {
      validator: (value: any) => {
        return typeof value === 'number' || value === 'unlimited';
      },
      message: (props) =>
        `${props.value} is not a valid value. It must be a number or 'unlimited'.`,
    },
  })
  videoFilesLimit: string | number;

  @Prop({ required: true })
  perHourRecordingTimeInHours: number;

  @Prop({ required: true })
  resoloutionUpto: string;

  @Prop({ required: true })
  fileTrashRecoveryTimeInDays: number;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
