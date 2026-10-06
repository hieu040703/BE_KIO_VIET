# Stringee module notes

- Playback và tải bản ghi âm dùng `GET /v1/common/stringee/recordings/:id`, trong đó `id` là ID của `CallHistory`. Route này phải giữ `authenticate` và `adminMiddleware`.
- `StringeeService.getRecordingStream()` đọc `recordingUrl` từ database, lấy REST API token ở server và gửi `X-STRINGEE-AUTH` tới Stringee; không đưa token vào URL hoặc response FE.
- Dùng `CallHistory.callId` làm `RECORD_ID` ưu tiên như XE_NOI_BAI; nếu thiếu mới đọc raw `recordingUrl` hoặc URL `/v1/call/play/...`/`/v1/call/recording/...`, rồi chuẩn hóa về endpoint tải `/v1/call/recording/{RECORD_ID}` và bỏ query token cũ.
- Cache REST token phải namespace theo `STRINGEE_API_KEY_SID` để không dùng nhầm token khi đổi cấu hình Stringee local.
- Proxy chuyển tiếp `Range`, `Content-Range`, `Content-Length`, `Content-Type` và đặt `Content-Disposition` theo query `download=1` để audio player tua được và nút tải hoạt động.
- Lỗi upstream được giữ status an toàn (`401/403` xác thực, `404` recording không tồn tại) và log thêm mã lỗi mạng nếu request không kết nối được.
- Mọi request REST dùng `config.STRINGEE_API_BASE_URL`, mặc định `https://asia-3.api.stringee.com` theo vùng của project Thiên Bảo. Domain chung trả `403 / keySid invalid` dù SDK app-to-app vẫn gọi được; không thay key hoặc công thức JWT để xử lý lỗi vùng.
- URL ghi âm cũ từ `api.stringee.com`, `icc-api.stringee.com` và URL `asia-3.api.stringee.com`/host cấu hình chỉ dùng để lấy record ID; request luôn gửi tới base URL cấu hình. Không log nguyên URL bản ghi âm vì URL provider có thể chứa credential.
- Lịch sử cuộc gọi trả thêm `caller.employee` và `receiver.employee` với `zaloName`/`name`; FE chọn nhân viên theo hướng gọi (gọi đi lấy caller, gọi đến lấy receiver).
- `CallHistory` dùng `ATA` cho cuộc gọi nội bộ và `PTP` cho cuộc gọi app/số điện thoại; `answer_url` truyền `callType`, `orderId`, `callerId`, `receiverId` và tên hiển thị qua `customData` để webhook `started` lưu đúng metadata.
- Với ATA, `callerPhoneNumber`/`receiverPhoneNumber` là `zaloName || name`; với PTP, nhân viên gọi khách lưu `callerId`, khách gọi vào nhân viên lưu `receiverId` chỉ khi đã route tới nhân viên, không gán cho hotline.
