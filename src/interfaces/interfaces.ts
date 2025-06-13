interface UserInterface {
  _id: string;
  name: string;
  email: string;
  planType: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  profilePicture: string;
  googleId: string;
  billingCardNumber: string;
  billingCardExpiry: string;
  billingCardCvc: string;
  stripeCustomerId: string;
}

interface FolderInterface {
  _id: string;
  name: string;
  userId: string;
  createdAt: Date;
  parentId?: string;
  updatedAt: Date;
  subfolders: string[];
  isActive: boolean;
}

interface AttachmentInterface {
  _id: string;
  name: string;
  path: string;
  size: number;
  mimetype: string;
  fileType: string;
  userId: string;
  attachmentParentId: string;
  url: string;
  folderId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isBlocked: boolean;
  videoDuration: number;
}

interface PlanInterface {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageFilesLimit: string | number;
  videoFilesLimit: string | number;
  perHourRecordingTimeInHours: number;
  resoloutionUpto: string;
  fileTrashRecoveryTimeInDays: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy: string;
}

interface CommentInterface {
  _id: string;
  comment: string;
  userId: string;
  userName: string;
  attachmentId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CardDetails {
  brand: string;
  country: string;
  last_four_digits: string;
  exp_year: number;
  exp_month: number;
}

interface PaymentsInterface {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: 'BASIC' | 'STANDARD' | 'PROFESSIONAL';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export {
  UserInterface,
  FolderInterface,
  AttachmentInterface,
  PlanInterface,
  CommentInterface,
  PaymentsInterface,
};
