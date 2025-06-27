/**
 * Example: S3 Multipart Upload from Frontend
 * 
 * This example demonstrates how to use the S3 multipart upload API
 * from a JavaScript frontend application.
 */

class S3MultipartUploader {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.chunkSize = 5 * 1024 * 1024; // 5MB chunks
  }

  async uploadFile(file, directory = 'uploads', folderId = null) {
    try {
      console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`);

      // Step 1: Initialize multipart upload
      const initResponse = await this.initUpload(file, directory, folderId);
      console.log('Upload initialized:', initResponse);

      // Step 2: Split file into chunks and upload
      const parts = await this.uploadChunks(file, initResponse.uploadId, initResponse.key);
      console.log('All chunks uploaded:', parts);

      // Step 3: Complete multipart upload
      const result = await this.completeUpload(
        initResponse.uploadId,
        initResponse.key,
        parts,
        file,
        folderId
      );
      console.log('Upload completed:', result);

      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      // Attempt to abort upload if we have uploadId
      if (error.uploadId) {
        await this.abortUpload(error.uploadId, error.key);
      }
      throw error;
    }
  }

  async initUpload(file, directory, folderId) {
    const response = await fetch(`${this.baseUrl}/s3/init-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        directory,
        folderId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize upload: ${response.statusText}`);
    }

    return await response.json();
  }

  async uploadChunks(file, uploadId, key) {
    const chunks = this.splitFileIntoChunks(file);
    const parts = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const partNumber = i + 1;

      console.log(`Uploading chunk ${partNumber}/${chunks.length}`);

      // Get presigned URL for this chunk
      const presignedUrl = await this.getPresignedUrl(uploadId, key, partNumber);

      // Upload chunk directly to S3
      const uploadResponse = await this.uploadChunkToS3(presignedUrl, chunk);

      parts.push({
        ETag: uploadResponse.ETag,
        PartNumber: partNumber,
      });
    }

    return parts;
  }

  async getPresignedUrl(uploadId, key, partNumber) {
    const response = await fetch(`${this.baseUrl}/s3/presign-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({
        uploadId,
        key,
        partNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.statusText}`);
    }

    const result = await response.json();
    return result.presignedUrl;
  }

  async uploadChunkToS3(presignedUrl, chunk) {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: chunk,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk to S3: ${response.statusText}`);
    }

    return {
      ETag: response.headers.get('ETag'),
    };
  }

  async completeUpload(uploadId, key, parts, file, folderId) {
    const response = await fetch(`${this.baseUrl}/s3/complete-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify({
        uploadId,
        key,
        parts,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        folderId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete upload: ${response.statusText}`);
    }

    return await response.json();
  }

  async abortUpload(uploadId, key) {
    try {
      await fetch(`${this.baseUrl}/s3/abort-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          uploadId,
          key,
        }),
      });
      console.log('Upload aborted successfully');
    } catch (error) {
      console.error('Failed to abort upload:', error);
    }
  }

  splitFileIntoChunks(file) {
    const chunks = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + this.chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = S3MultipartUploader;
} 