# S3 Multipart Upload Implementation

This document describes the backend implementation of S3 multipart upload functionality for the Next Recorder Backend.

## Overview

The S3 multipart upload implementation allows for efficient uploading of large files by splitting them into smaller chunks and uploading them in parallel. This approach provides:

- **Large file support**: No file size limits
- **Resumable uploads**: Upload can be resumed if interrupted
- **Better performance**: Parallel chunk uploads
- **Direct S3 upload**: Reduces server load
- **Progress tracking**: Real-time upload progress

## Architecture

### Backend Components

1. **S3Controller** (`src/controllers/s3.controller.ts`)
   - Handles HTTP requests for multipart upload operations
   - Protected by JWT authentication
   - Provides RESTful API endpoints

2. **S3BucketService** (`src/services/s3-bucket.service.ts`)
   - Core business logic for S3 operations
   - Manages multipart upload lifecycle
   - Handles file metadata and database operations

3. **S3Module** (`src/components/s3/s3.module.ts`)
   - Organizes S3-related components
   - Provides dependency injection

### Data Transfer Objects (DTOs)

- `InitMultipartUploadDto`: Initialize multipart upload
- `GetPresignedUrlDto`: Get presigned URL for chunk upload
- `CompleteMultipartUploadDto`: Complete multipart upload

### Response Types

- `IInitMultipartUploadResponse`: Upload initialization response
- `IGetPresignedUrlResponse`: Presigned URL response
- `ICompleteMultipartUploadResponse`: Upload completion response

## API Endpoints

### 1. Initialize Multipart Upload

**Endpoint:** `POST /s3/init-upload`

**Request Body:**
```json
{
  "fileName": "video.mp4",
  "contentType": "video/mp4",
  "directory": "uploads/videos",
  "folderId": "optional-folder-id"
}
```

**Response:**
```json
{
  "uploadId": "multipart-upload-id",
  "key": "uploads/videos/video-1234567890.mp4",
  "bucket": "your-s3-bucket"
}
```

### 2. Get Presigned URL for Part

**Endpoint:** `POST /s3/presign-url`

**Request Body:**
```json
{
  "uploadId": "multipart-upload-id",
  "key": "uploads/videos/video-1234567890.mp4",
  "partNumber": 1
}
```

**Response:**
```json
{
  "presignedUrl": "https://s3.amazonaws.com/...",
  "expiresIn": 3600
}
```

### 3. Complete Multipart Upload

**Endpoint:** `POST /s3/complete-upload`

**Request Body:**
```json
{
  "uploadId": "multipart-upload-id",
  "key": "uploads/videos/video-1234567890.mp4",
  "parts": [
    {
      "ETag": "\"etag1\"",
      "PartNumber": 1
    },
    {
      "ETag": "\"etag2\"",
      "PartNumber": 2
    }
  ],
  "fileName": "video.mp4",
  "contentType": "video/mp4",
  "fileSize": 10485760,
  "folderId": "optional-folder-id"
}
```

**Response:**
```json
{
  "fileId": "database-file-id",
  "fileName": "video.mp4",
  "fileUrl": "https://bucket.s3.region.amazonaws.com/key",
  "key": "uploads/videos/video-1234567890.mp4"
}
```

### 4. Abort Multipart Upload

**Endpoint:** `POST /s3/abort-upload`

**Request Body:**
```json
{
  "uploadId": "multipart-upload-id",
  "key": "uploads/videos/video-1234567890.mp4"
}
```

**Response:** `204 No Content`

## Upload Flow

1. **Initialize Upload**
   - Client calls `/s3/init-upload`
   - Backend creates multipart upload in S3
   - Returns `uploadId` and `key`

2. **Upload Chunks**
   - Client splits file into chunks (recommended: 5MB each)
   - For each chunk:
     - Call `/s3/presign-url` to get presigned URL
     - Upload chunk directly to S3 using presigned URL
     - Store ETag and part number

3. **Complete Upload**
   - Client calls `/s3/complete-upload` with all parts
   - Backend completes multipart upload in S3
   - Creates file record in database
   - Returns file details

4. **Error Handling**
   - If upload fails, call `/s3/abort-upload`
   - Backend cleans up incomplete upload in S3

## Configuration

### Environment Variables

```env
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
AWS_REGION=your-region
MONGO_URI=your-mongodb-connection-string
```

### S3 Bucket Configuration

Ensure your S3 bucket has the following CORS configuration:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

## Security

- All endpoints are protected by JWT authentication
- Presigned URLs expire after 1 hour
- File metadata includes user ID for access control
- S3 bucket policies should restrict access appropriately

## Error Handling

The implementation includes comprehensive error handling:

- **Network errors**: Automatic retry logic (frontend)
- **Authentication errors**: Clear error messages
- **S3 errors**: Proper HTTP status codes
- **Database errors**: Transaction rollback

## Performance Considerations

- **Chunk size**: 5MB recommended for optimal performance
- **Parallel uploads**: Upload multiple chunks simultaneously
- **Connection pooling**: Reuse HTTP connections
- **Caching**: Cache presigned URLs when possible

## Testing

### Manual Testing

1. Use Postman or similar tool to test endpoints
2. Test with files of various sizes
3. Test error scenarios (network failure, invalid credentials)
4. Test concurrent uploads

### Automated Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## Monitoring

Monitor the following metrics:

- Upload success/failure rates
- Average upload time
- S3 API call costs
- Database performance
- Error rates by endpoint

## Troubleshooting

### Common Issues

1. **CORS errors**: Check S3 bucket CORS configuration
2. **Authentication errors**: Verify JWT token and AWS credentials
3. **Upload failures**: Check network connectivity and S3 permissions
4. **Database errors**: Verify MongoDB connection and schema

### Logs

Check application logs for detailed error information:

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## Future Enhancements

- **Resumable uploads**: Store upload state in database
- **Progress tracking**: WebSocket-based real-time progress
- **File validation**: Server-side file type and size validation
- **Compression**: Automatic file compression before upload
- **CDN integration**: CloudFront distribution for faster access

## Dependencies

- `aws-sdk`: AWS SDK for Node.js
- `mime-types`: MIME type detection
- `fluent-ffmpeg`: Video processing (for duration extraction)
- `mongoose`: MongoDB ODM
- `@nestjs/*`: NestJS framework

## License

This implementation is part of the Next Recorder Backend project. 