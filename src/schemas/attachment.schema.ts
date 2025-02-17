import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Collections } from 'src/constants';

export type AttachmentDocument = Attachment & Document;

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
export class Attachment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true }) // image/png or video/mp4
  mimetype: string;

  @Prop({ required: true }) // image or video
  fileType: string;

  @Prop({
    required: true,
    ref: Collections.users,
  })
  userId: string;

  @Prop({ default: null })
  attachmentParentId: string; // For video thumbnails

  @Prop({ default: null })
  folderId: string;

  @Prop({ default: null })
  url: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: null })
  videoDuration: number;

  @Prop({ default: false })
  isReported: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
