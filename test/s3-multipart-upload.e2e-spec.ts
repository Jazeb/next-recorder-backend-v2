import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('S3 Multipart Upload (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Note: In a real test, you would need to authenticate and get a valid JWT token
    // For this example, we'll assume you have a valid token
    authToken = 'your-jwt-token-here';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/s3/init-upload (POST)', () => {
    it('should initialize multipart upload', () => {
      return request(app.getHttpServer())
        .post('/s3/init-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileName: 'test-video.mp4',
          contentType: 'video/mp4',
          directory: 'uploads/videos',
          folderId: null,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('uploadId');
          expect(res.body).toHaveProperty('key');
          expect(res.body).toHaveProperty('bucket');
          expect(typeof res.body.uploadId).toBe('string');
          expect(typeof res.body.key).toBe('string');
          expect(typeof res.body.bucket).toBe('string');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/s3/init-upload')
        .send({
          fileName: 'test-video.mp4',
          contentType: 'video/mp4',
        })
        .expect(401);
    });
  });

  describe('/s3/presign-url (POST)', () => {
    it('should get presigned URL for part', () => {
      return request(app.getHttpServer())
        .post('/s3/presign-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          uploadId: 'test-upload-id',
          key: 'uploads/videos/test-video.mp4',
          partNumber: 1,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('presignedUrl');
          expect(res.body).toHaveProperty('expiresIn');
          expect(typeof res.body.presignedUrl).toBe('string');
          expect(typeof res.body.expiresIn).toBe('number');
        });
    });
  });

  describe('/s3/complete-upload (POST)', () => {
    it('should complete multipart upload', () => {
      return request(app.getHttpServer())
        .post('/s3/complete-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          uploadId: 'test-upload-id',
          key: 'uploads/videos/test-video.mp4',
          parts: [
            { ETag: '"test-etag-1"', PartNumber: 1 },
            { ETag: '"test-etag-2"', PartNumber: 2 },
          ],
          fileName: 'test-video.mp4',
          contentType: 'video/mp4',
          fileSize: 10485760,
          folderId: null,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('fileId');
          expect(res.body).toHaveProperty('fileName');
          expect(res.body).toHaveProperty('fileUrl');
          expect(res.body).toHaveProperty('key');
          expect(typeof res.body.fileId).toBe('string');
          expect(typeof res.body.fileName).toBe('string');
          expect(typeof res.body.fileUrl).toBe('string');
          expect(typeof res.body.key).toBe('string');
        });
    });
  });

  describe('/s3/abort-upload (POST)', () => {
    it('should abort multipart upload', () => {
      return request(app.getHttpServer())
        .post('/s3/abort-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          uploadId: 'test-upload-id',
          key: 'uploads/videos/test-video.mp4',
        })
        .expect(204);
    });
  });
}); 