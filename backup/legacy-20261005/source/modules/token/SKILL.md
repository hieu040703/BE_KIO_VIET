# Token module notes

- Một dòng trong bảng `tokens` có thể chứa `refreshToken`, `firebaseToken`, hoặc cả hai; khi Firebase token không còn hợp lệ chỉ đặt `firebaseToken = NULL`, không xóa cả dòng để bảo toàn refresh session.
- `TokenRepository.findFirebaseTokens` đọc token Firebase theo cursor `id` với batch tối đa 500 bản ghi.
- `TokenRepository.clearFirebaseTokens` chỉ cập nhật các Firebase token đang còn hoạt động; job dọn token chạy FCM `dryRun` và chỉ truyền các token bị FCM trả về lỗi permanent.
