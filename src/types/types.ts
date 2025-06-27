type IAuthTokenResponse = {
  userId: string;
  name: string;
  email: string;
  access_token: string;
  createdAt: Date;
  updatedAt: Date;
};

type IFileUploadResponse = {
  ETag: string;
  ServerSideEncryption: string;
  VersionId: string;
  Location: string;
  key: string;
  Key: string;
  Bucket: string;
  url: string;
};

type Folder = {
  _id: string;
  name: string;
  userId: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
  subfolders: string[];
  isActive: boolean;
};

type SignedInUserType = {
  userId: string;
  userName: string;
  email: string;
};

// S3 Multipart Upload Types
type IInitMultipartUploadResponse = {
  uploadId: string;
  key: string;
  bucket: string;
};

type IGetPresignedUrlResponse = {
  presignedUrl: string;
  expiresIn: number;
};

type ICompleteMultipartUploadResponse = {
  fileId: string;
  fileName: string;
  fileUrl: string;
  key: string;
};

export { 
  IAuthTokenResponse, 
  IFileUploadResponse, 
  Folder, 
  SignedInUserType,
  IInitMultipartUploadResponse,
  IGetPresignedUrlResponse,
  ICompleteMultipartUploadResponse
};
