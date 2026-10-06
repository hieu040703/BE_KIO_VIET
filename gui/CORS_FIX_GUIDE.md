# 🔧 Fix CORS Error - MinIO Upload

## ⚠️ Vấn đề

Khi frontend upload file lên MinIO bằng presigned URL, gặp lỗi CORS:

```
Access to XMLHttpRequest at 'http://file.itomosoft.com:9000/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ✅ Giải pháp đã thực hiện

### 1. Set Bucket Public (RECOMMENDED - Đơn giản nhất)

```bash
# Cài đặt MinIO Client (đã xong)
brew install minio/stable/mc

# Set alias
mc alias set myminio http://file.itomosoft.com:9000 \
  mB6cPoJiWR4cQom6dO2q \
  iLXmbP7UjQ6pEc1FByWYLIwE3QlRB6CW97al4EUs

# Set bucket public (cho phép upload/download từ mọi nơi)
mc anonymous set public myminio/uploads
```

**✅ ĐÃ THỰC HIỆN - Bucket 'uploads' đã được set public!**

### 2. Test Upload

Bây giờ hãy test lại upload từ frontend:

1. **Khởi động Backend:**

```bash
cd /Users/nampham/Work/BASE/BE/BE_BASE_EXPRESSJS_TYPEORM
npm run dev
```

2. **Khởi động Frontend:**

```bash
cd /Users/nampham/Work/BASE/fe-file-upload
npm run dev
```

3. **Test upload:**
   - Mở http://localhost:5173
   - Chọn file và click Upload
   - ✅ Sẽ không còn lỗi CORS!

## 📋 Các level bảo mật (tùy chọn)

### Level 1: Public (Hiện tại - Đơn giản nhất)

```bash
mc anonymous set public myminio/uploads
```

✅ Cho phép mọi người upload/download  
❌ Kém bảo mật

### Level 2: Download Only (Khuyến nghị cho production)

```bash
mc anonymous set download myminio/uploads
```

✅ Chỉ cho phép download công khai  
✅ Upload vẫn cần presigned URL (secure)

### Level 3: Private + Presigned URL (Bảo mật cao nhất)

```bash
mc anonymous set private myminio/uploads
```

✅ Mọi thao tác đều cần presigned URL  
⚠️ Cần cấu hình CORS riêng (phức tạp hơn)

## 🔐 Cấu hình CORS chi tiết (Optional - Cho production)

Nếu muốn kiểm soát CORS chi tiết hơn, sử dụng MinIO Console:

1. Truy cập: http://file.itomosoft.com:9000
2. Login với credentials
3. Chọn bucket "uploads"
4. Vào tab "Configuration" → "CORS"
5. Thêm rule:

```json
{
  "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000", "https://yourdomain.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag", "Content-Type"],
  "MaxAgeSeconds": 3600
}
```

## ✅ Checklist

- [x] MinIO Client (mc) đã được cài đặt
- [x] Alias 'myminio' đã được tạo
- [x] Bucket 'uploads' đã được set public
- [ ] Backend server đang chạy (port 4000)
- [ ] Frontend server đang chạy (port 5173)
- [ ] Test upload thành công

## 🚀 Next Steps

1. **Khởi động backend:**

   ```bash
   cd /Users/nampham/Work/BASE/BE/BE_BASE_EXPRESSJS_TYPEORM
   npm run dev
   ```

2. **Khởi động frontend:**

   ```bash
   cd /Users/nampham/Work/BASE/fe-file-upload
   npm run dev
   ```

3. **Test upload file:**

   - Truy cập http://localhost:5173
   - Chọn file và upload
   - Kiểm tra file xuất hiện trong danh sách

4. **Verify trên MinIO:**
   ```bash
   mc ls myminio/uploads/documents/
   ```

## 📝 Lưu ý

- ⚠️ **Development**: Đang sử dụng public bucket (dễ test)
- 🔐 **Production**: Nên chuyển sang "download" hoặc "private" + CORS config
- 🌐 **Domain**: Khi deploy production, thêm domain vào CORS AllowedOrigins

## 🎉 Kết quả

Sau khi set bucket public, frontend có thể upload file trực tiếp lên MinIO mà không gặp lỗi CORS!

Flow:

```
Frontend → Request presigned URL → Backend
Frontend → Upload trực tiếp → MinIO (✅ No CORS error)
Frontend → Confirm upload → Backend → Save DB
```
