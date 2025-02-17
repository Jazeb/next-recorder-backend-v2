import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FolderInterface } from 'src/interfaces/interfaces';

export type FolderDocument = Folder & Document;

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id.toString(); // Map _id to id
      delete ret._id; // Remove _id from the response
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class Folder {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, ref: 'User' })
  userId: string; // Reference to the User who owns this folder

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: null })
  parentId: string;

  @Prop([{ ref: 'Folder', type: String, default: [] }])
  subfolders: string[]; // List of subfolders

  @Prop({ default: true })
  isActive: boolean;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
