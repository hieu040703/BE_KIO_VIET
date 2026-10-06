# tôi muốn tạo thêm 1 module xử lý RAG, với kế hoạch và các yêu cầu như sau:

- môi trường: Express.js + TypeORM + PostgreSQL/pgvector + LangChain + Google Gemini.
- database postgresql tôi đã cài extention pgvector

1: Chuẩn bị

- Cài LangChain + Gemini
- Tách connection pool: TypeORM dùng pool chính (max: 20). LangChain dùng pg.Pool riêng (max: 10)
  => ✅ Checkpoint: npm run db:migrate chạy thành công. Kết nối pgvector test pass.

2: Thiết kế Schema & Migration
Mục tiêu: Dữ liệu quan hệ + vector đồng bộ an toàn, không xung đột TypeORM. Dữ liệu gốc lấy từ bảng ServerOrder , bảng lưu vector ServiceOrderVector.

- ServerOrder: Thêm trường đồng bộ @Column({ default: false }) syncedToVector: boolean
- Migration tạo bảng vector
- Index HNSW cho vector
- Validation schema đầu vào
  => ✅ Checkpoint: Migration áp dụng được. Query TypeORM + raw pg vector cùng hoạt động.

3: Pipeline Đồng bộ TypeORM → pgvector
Mục tiêu: Tự động đẩy đơn hàng lịch sử lên vector, đảm bảo idempotent & hiệu suất.

- Service fetch đơn hoàn thành
- Format text embedding
- Tạo Document LangChain
- Upsert vào pgvector
- Cập nhật flag sync
- Lập lịch & sự kiện
  ⚠️ Lưu ý production:
  Dùng transaction riêng hoặc queue (BullMQ) nếu sync > 500 đơn/lần.
  Retry 3 lần với backoff nếu Gemini Embedding timeout.
  => ✅ Checkpoint: Sync chạy ổn định, không trùng lặp, metadata đúng định dạng JSONB.

4: Xây dựng RAG Core (LangChain + Gemini)
Mục tiêu: Chain chuẩn production, output JSON cứng, retrieval chính xác, fallback an toàn.

- Config Embedding
- Config LLM
- Zod Schema output
- Structured Output
- Prompt Template : System: chuyên gia định giá, rule trả confidence: "low" nếu context yếu. Human: {query} + {context}
- LCEL Chain
- Metadata Filter
- Fallback & Retry

5: Tích hợp Express & API Production
Mục tiêu: API ổn định, bảo mật, cache, logging, sẵn sàng test tích hợp.

- Route & Controller
- Validate request
- Cache kết quả : Redis key = sha256(query + filters), TTL 2h. Bypass chain nếu hit.
- Rate Limit & Auth : express-rate-limit, JWT/ApiKey middleware
- Structured Logging : winston, log query_hash, latency_ms, confidence, reference_ids
- Error Handling
  => ✅ Checkpoint: Postman/Insomnia test pass. Log đầy đủ. Cache hit > 40% trong test.
