-- =============================================================================
-- Index tối ưu GET /orders — bản CONCURRENTLY cho PRODUCTION (zero write-lock)
-- =============================================================================
--
-- KHI NÀO DÙNG FILE NÀY (thay vì migration):
--   - Production đang chạy, không được khoá ghi trên bảng lớn
--     (order_comments ~105k, view_comments ~120k, order_employees ~33k...).
--   - CREATE INDEX CONCURRENTLY không khoá INSERT/UPDATE/DELETE, nhưng
--     KHÔNG chạy được trong transaction → không thể để trong TypeORM migration.
--
-- CÁCH CHẠY:
--   1. Đăng nhập DB bằng role OWNER các bảng (ở DB test là `postgres`,
--      KHÔNG phải app user `bocxep` — bocxep không có quyền tạo index các bảng này):
--        psql "postgresql://postgres:<pass>@<host>:5432/thienbao" -f order-list-indexes.concurrent.sql
--   2. Chạy từng lệnh (mỗi CONCURRENTLY là 1 statement độc lập, KHÔNG bọc BEGIN/COMMIT).
--   3. Sau khi xong, `yarn db:migrate` sẽ áp migration 1778300000000 và no-op
--      (IF NOT EXISTS thấy index đã tồn tại) — chỉ ghi nhận migration đã chạy.
--
-- AN TOÀN:
--   - IF NOT EXISTS: chạy lại nhiều lần không lỗi.
--   - Nếu một CONCURRENTLY bị gián đoạn → để lại index INVALID; kiểm tra bằng
--     truy vấn cuối file, DROP INDEX rồi tạo lại.
--   - Thời điểm chạy: off-peak (build index vẫn tốn CPU/IO dù không khoá ghi).
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_finances_order_type"
  ON "finances" ("orderId", "type");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_order_employees_active_order"
  ON "order_employees" ("orderId")
  WHERE "deletedAt" IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_order_comments_active_order_created"
  ON "order_comments" ("orderId", "createdAt" DESC)
  WHERE "deletedAt" IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_view_comments_unread_user_oc"
  ON "view_comments" ("userId", "orderCommentId")
  WHERE "isViewed" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_order_leaders_active_order"
  ON "order_leaders" ("orderId")
  WHERE "deletedAt" IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_order_details_active_order"
  ON "order_details" ("orderId")
  WHERE "deletedAt" IS NULL;

-- (khuyến nghị) cập nhật planner stats sau khi tạo index:
ANALYZE "finances", "order_employees", "order_comments", "view_comments", "order_leaders", "order_details";

-- -----------------------------------------------------------------------------
-- Kiểm tra index INVALID (nếu CONCURRENTLY bị gián đoạn giữa chừng):
--   SELECT c.relname, i.indisvalid
--   FROM pg_class c JOIN pg_index i ON i.indexrelid = c.oid
--   WHERE c.relname LIKE 'IDX_%order%' OR c.relname LIKE 'IDX_%finances%';
-- Nếu indisvalid = false → DROP INDEX CONCURRENTLY "<tên>"; rồi tạo lại.
-- -----------------------------------------------------------------------------
