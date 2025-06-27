import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Matches,
  ValidateIf,
  ValidationArguments,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class CreateFolderDto {
  @ApiProperty({ type: 'string', description: 'Folder name' })
  @Transform(({ value }) => value.toLowerCase())
  readonly name: string;

  @ApiProperty({
    type: 'string',
    description: 'Parent folder id',
    default: null,
  })
  readonly parentId?: string; // optional, if not provided, folder is at the root level
}

class LoginDto {
  @ApiProperty({
    type: 'string',
    format: 'email',
    description: 'User email address',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: 'string', description: 'User password' })
  @IsNotEmpty()
  password: string;
}

class ResponseDto<T> {
  @ApiProperty()
  success: boolean = true;
  @ApiProperty()
  message: string = '';
  @ApiProperty()
  exception: any = '';
  @ApiProperty()
  data: T = null;

  constructor(data: T) {
    this.data = data;
  }
}

class SignUp {
  @ApiProperty({
    type: 'string',
    format: 'email',
    description: 'User email address',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: 'string', description: 'User name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'string', description: 'User password' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: 'string', description: 'User billing card number' })
  @IsNotEmpty()
  billingCardNumber: string;

  @ApiProperty({ type: 'string', description: 'User billing card expiry' })
  @IsNotEmpty()
  billingCardExpiry: string;

  @ApiProperty({ type: 'string', description: 'User billing card cvc' })
  @IsNotEmpty()
  billingCardCvc: string;
}

class FileUploadDto {
  @ApiProperty({ type: 'string', description: 'Folder id' })
  folderId?: string; // optional, if not provided, file is at the root level
}

class MoveFolderDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  folderId: string;

  @ApiProperty({ type: 'string', description: 'New Parent Folder Id' })
  @IsNotEmpty()
  newparentFolderId: string;
}

class MoveMediaItemDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  newparentFolderId: string;
}

class CreateNewPlanDto {
  @ApiProperty({ type: 'string', description: 'Plan name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: 'number', description: 'Plan price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ type: 'string', description: 'Plan description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Image files limit (can be a number or "unlimited")',
  })
  @ValidateIf((o) => typeof o.imageFilesLimit === 'string')
  @Matches(/^unlimited$/, {
    message: (args: ValidationArguments) =>
      `${args.value} is not valid. Must be 'unlimited' if string.`,
  })
  @ValidateIf((o) => typeof o.imageFilesLimit === 'number')
  @IsNumber({}, { message: 'Must be a number if not "unlimited".' })
  @IsNotEmpty()
  imageFilesLimit: string | number;

  @ApiProperty({
    description: 'Video files limit (can be a number or "unlimited")',
  })
  @ValidateIf((o) => typeof o.videoFilesLimit === 'string')
  @Matches(/^unlimited$/, {
    message: (args: ValidationArguments) =>
      `${args.value} is not valid. Must be 'unlimited' if string.`,
  })
  @ValidateIf((o) => typeof o.videoFilesLimit === 'number')
  @IsNumber({}, { message: 'Must be a number if not "unlimited".' })
  @IsNotEmpty()
  videoFilesLimit: string | number;

  @ApiProperty({ type: 'number', description: 'Per hour recording time' })
  @IsNumber()
  @IsNotEmpty()
  perHourRecordingTimeInHours: number;

  @ApiProperty({ type: 'string', description: 'Resolution upto' })
  @IsString()
  @IsNotEmpty()
  resoloutionUpto: string;

  @ApiProperty({ type: 'number', description: 'File trash recovery time' })
  @IsNumber()
  @IsNotEmpty()
  fileTrashRecoveryTimeInDays: number;
}

class CreateNewComment {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  attachmentId: string;
}

class UpdateFileNamePayload {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CardDetailsDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  last_four_digits: string;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  exp_year: number;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  exp_month: number;
}

class CreatePaymentDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: 'string' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ type: 'string' })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ type: CardDetailsDto })
  @IsObject()
  @Type(() => CardDetailsDto)
  @IsNotEmpty()
  cardDetails: CardDetailsDto;
}

// S3 Multipart Upload DTOs
class InitMultipartUploadDto {
  @ApiProperty({ type: 'string', description: 'File name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ type: 'string', description: 'File MIME type' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ type: 'string', description: 'Directory path', required: false })
  @IsString()
  directory?: string;

  @ApiProperty({ type: 'string', description: 'Folder ID', required: false })
  @IsString()
  folderId?: string;
}

class GetPresignedUrlDto {
  @ApiProperty({ type: 'string', description: 'Upload ID from init response' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ type: 'string', description: 'File key from init response' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ type: 'number', description: 'Part number (1-based)' })
  @IsNumber()
  @IsNotEmpty()
  partNumber: number;
}

class CompleteMultipartUploadDto {
  @ApiProperty({ type: 'string', description: 'Upload ID from init response' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ type: 'string', description: 'File key from init response' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ 
    type: 'array', 
    items: { 
      type: 'object',
      properties: {
        ETag: { type: 'string' },
        PartNumber: { type: 'number' }
      }
    },
    description: 'Array of uploaded parts with ETags and part numbers'
  })
  @IsNotEmpty()
  parts: Array<{ ETag: string; PartNumber: number }>;

  @ApiProperty({ type: 'string', description: 'Original file name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ type: 'string', description: 'File MIME type' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ type: 'number', description: 'File size in bytes' })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({ type: 'string', description: 'Folder ID', required: false })
  @IsString()
  folderId?: string;
}

export {
  CreateFolderDto,
  LoginDto,
  ResponseDto,
  SignUp,
  FileUploadDto,
  MoveFolderDto,
  MoveMediaItemDto,
  CreateNewPlanDto,
  CreateNewComment,
  UpdateFileNamePayload,
  CreatePaymentDto,
  InitMultipartUploadDto,
  GetPresignedUrlDto,
  CompleteMultipartUploadDto,
};
