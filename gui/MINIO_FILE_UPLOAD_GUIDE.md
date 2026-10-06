# MinIO File Upload API - Backend Guide

## Tổng quan

API tích hợp MinIO vào module common, sử dụng **presigned URL** để upload file trực tiếp lên MinIO storage.

## Các file đã tạo

### 1. Database Model

- **FileUpload.ts** - Entity lưu metadata của file

### 2. Repository

- **fileUpload.repository.ts** - Data access layer

### 3. Service

- **fileUpload.service.ts** - Business logic

### 4. Controller

- **fileUpload.controller.ts** - API endpoints

### 5. Configuration

- **common.types.ts** - DI symbols
- **common.container.ts** - Dependency injection setup
- **common.route.ts** - Route definitions

## Migration Database

Chạy migration để tạo bảng `file_uploads`:

```bash
npm run migration:generate -- CreateFileUploadTable
npm run migration:run
```

Hoặc tạo migration thủ công:

```sql
CREATE TABLE file_uploads (
  id SERIAL PRIMARY KEY,
  "objectName" VARCHAR(500) NOT NULL,
  "originalName" VARCHAR(255) NOT NULL,
  "bucketName" VARCHAR(100) NOT NULL,
  "mimeType" VARCHAR(50),
  size BIGINT NOT NULL,
  folder VARCHAR(255),
  etag VARCHAR(100),
  "downloadUrl" VARCHAR(1000),
  "uploadedBy" INTEGER,
  metadata JSONB,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP,
  FOREIGN KEY ("uploadedBy") REFERENCES users(id)
);

CREATE INDEX idx_file_uploads_bucket_object ON file_uploads("bucketName", "objectName");
CREATE INDEX idx_file_uploads_folder ON file_uploads(folder);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads("uploadedBy");
```

## API Endpoints

### 1. Lấy Presigned Upload URL

**Request:**

```http
GET /api/common/files/presigned-upload-url?filename=test.pdf&folder=documents&bucketName=uploads
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Presigned URL created successfully",
  "data": {
    "uploadUrl": "http://file.itomosoft.com:9000/uploads/documents/1702345678-test.pdf?X-Amz-Algorithm=...",
    "objectName": "documents/1702345678-test.pdf",
    "bucketName": "uploads"
  }
}
```

### 2. Xác nhận Upload

**Request:**

```http
POST /api/common/files/confirm-upload
Content-Type: application/json

{
  "objectName": "documents/1702345678-test.pdf",
  "originalName": "test.pdf",
  "bucketName": "uploads",
  "mimeType": "application/pdf",
  "size": 102400,
  "folder": "documents"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "objectName": "documents/1702345678-test.pdf",
    "originalName": "test.pdf",
    "bucketName": "uploads",
    "mimeType": "application/pdf",
    "size": 102400,
    "folder": "documents",
    "downloadUrl": "http://file.itomosoft.com:9000/...",
    "uploadedBy": 1,
    "createdAt": "2024-12-12T10:00:00.000Z",
    "updatedAt": "2024-12-12T10:00:00.000Z"
  }
}
```

### 3. Liệt kê Files

**Request:**

```http
GET /api/common/files?page=1&limit=20&folder=documents
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Files retrieved successfully",
  "data": {
    "files": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 4. Chi tiết File

**Request:**

```http
GET /api/common/files/1
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "File detail retrieved successfully",
  "data": {
    "id": 1,
    "objectName": "documents/1702345678-test.pdf",
    "originalName": "test.pdf",
    "downloadUrl": "http://...",
    ...
  }
}
```

### 5. Download URL

**Request:**

```http
GET /api/common/files/1/download-url?expiry=3600
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Download URL created successfully",
  "data": {
    "downloadUrl": "http://file.itomosoft.com:9000/..."
  }
}
```

### 6. Xóa File

**Request:**

```http
DELETE /api/common/files/1
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "File deleted successfully",
  "data": null
}
```

## Upload Flow

```
┌─────────┐                ┌─────────┐                ┌──────┐
│ Frontend│                │ Backend │                │ MinIO│
└────┬────┘                └────┬────┘                └───┬──┘
     │                          │                         │
     │  1. GET presigned URL    │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │  2. Return URL           │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │  3. PUT file (direct)    │                         │
     ├──────────────────────────┼────────────────────────>│
     │                          │                         │
     │  4. Upload success       │                         │
     │<─────────────────────────┼─────────────────────────┤
     │                          │                         │
     │  5. POST confirm upload  │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │  6. Verify file exists  │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │  7. File metadata       │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │  8. Save to DB          │
     │                          │                         │
     │  9. Return file info     │                         │
     │<─────────────────────────┤                         │
```

## MinIO Configuration

File cấu hình: `src/shared/config/minio.ts`

```typescript
const minioClient = new Minio.Client({
  endPoint: "file.itomosoft.com",
  port: 9000,
  useSSL: false,
  accessKey: "your-access-key",
  secretKey: "your-secret-key",
});
```

## Testing

Test API với curl:

```bash
# 1. Get presigned URL
curl "http://localhost:3000/api/common/files/presigned-upload-url?filename=test.txt&folder=demo"

# 2. Upload file to MinIO
curl -X PUT -T test.txt "PRESIGNED_URL_FROM_STEP_1"

# 3. Confirm upload
curl -X POST http://localhost:3000/api/common/files/confirm-upload \
  -H "Content-Type: application/json" \
  -d '{
    "objectName": "demo/1702345678-test.txt",
    "originalName": "test.txt",
    "bucketName": "uploads",
    "mimeType": "text/plain",
    "size": 1024
  }'

# 4. List files
curl "http://localhost:3000/api/common/files?page=1&limit=10"

# 5. Get file detail
curl "http://localhost:3000/api/common/files/1"

# 6. Delete file
curl -X DELETE "http://localhost:3000/api/common/files/1"
```

## Security Notes

1. **Authentication**: Thêm middleware xác thực user cho các endpoints
2. **File Size Limit**: Giới hạn kích thước file
3. **File Type Validation**: Validate loại file được phép upload
4. **Rate Limiting**: Giới hạn số lượng request
5. **Expiry Time**: Presigned URL có thời hạn (upload: 15 phút, download: 7 ngày)

## Troubleshooting

### Error: Bucket not found

```bash
# Tạo bucket thủ công
mc mb myminio/uploads
```

### Error: Access denied

- Kiểm tra MinIO access key và secret key
- Kiểm tra bucket policy

### Error: File not found after upload

- Đợi vài giây sau khi upload trước khi confirm
- Kiểm tra objectName có đúng không

## Next Steps

1. Thêm authentication middleware
2. Implement file type validation
3. Add file size limit
4. Implement upload progress tracking
5. Add image thumbnail generation
6. Implement virus scanning
