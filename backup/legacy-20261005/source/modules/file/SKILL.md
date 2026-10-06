## File module notes

- File preview dùng `GET /files/:id/preview` để chuyển ảnh thành JPEG bằng `sharp`; file gốc không bị thay đổi và vẫn dùng cho tải xuống.
- Thumbnail được tạo từ nội dung JPEG phải có đuôi `.jpg`, tránh static server trả MIME theo đuôi `.HEIC`/`.png` không khớp với nội dung thumbnail.
- HEIC/HEIF được nhận diện theo cả MIME type và phần mở rộng vì trình duyệt có thể gửi MIME rỗng hoặc `application/octet-stream`.
- Nếu binary `sharp` không giải mã được HEIC/HEVC, `FileService` fallback sang `heif-convert`; image Docker production phải cài `libheif-tools` để cung cấp binary này.
- Upload HEIC/HEIF qua `POST /files` được chuyển thành JPEG trước khi tạo bản ghi; `fileName`, path, URL và size theo JPEG, còn `originalName` giữ tên nguồn để FE ghép kết quả upload.
