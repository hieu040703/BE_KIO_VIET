-- =============================================================================
-- One-shot: chuyển ownership order_leaders (+ enum + seq liên quan) về app user.
-- Chạy bằng role `postgres` (superuser) trực tiếp trên DB server, KHÔNG cần
-- mở pg_hba cho postgres từ xa.
--
-- Cách dùng:
--   ssh <db-host>
--   sudo -u postgres psql -d bocxep -f fix-order-leaders-owner.sql
--   (thay 'bocxep' bằng app user thật trong .env nếu khác)
--
-- Idempotent — chạy nhiều lần không lỗi.
-- =============================================================================

\set ON_ERROR_STOP on

DO $body$
DECLARE
  v_app_user text := 'bocxep';  -- <-- thay bằng DB_USERNAME thật trong .env
  v_table_owner text;
  v_enum_owner text;
BEGIN
  -- 1. Table order_leaders
  SELECT tableowner INTO v_table_owner
  FROM pg_tables WHERE schemaname='public' AND tablename='order_leaders';

  IF v_table_owner IS NULL THEN
    RAISE NOTICE 'order_leaders not found in public — skip';
  ELSIF v_table_owner = v_app_user THEN
    RAISE NOTICE 'order_leaders already owned by % — skip', v_app_user;
  ELSE
    EXECUTE format('ALTER TABLE public.order_leaders OWNER TO %I', v_app_user);
    RAISE NOTICE 'order_leaders: % -> %', v_table_owner, v_app_user;
  END IF;

  -- 2. Enum order_leaders_type_enum (nếu đã tồn tại do lần chạy trước)
  SELECT t.typowner::regrole::text INTO v_enum_owner
  FROM pg_type t WHERE t.typname = 'order_leaders_type_enum';

  IF v_enum_owner IS NOT NULL AND v_enum_owner <> v_app_user THEN
    EXECUTE format('ALTER TYPE public.order_leaders_type_enum OWNER TO %I', v_app_user);
    RAISE NOTICE 'order_leaders_type_enum: % -> %', v_enum_owner, v_app_user;
  END IF;

  -- 3. Tất cả sequence liên quan order_leaders (nếu có)
  FOR v_table_owner IN
    SELECT sequencename FROM pg_sequences
    WHERE schemaname='public' AND sequencename ILIKE '%order_leaders%'
  LOOP
    EXECUTE format('ALTER SEQUENCE public.%I OWNER TO %I', v_table_owner, v_app_user);
    RAISE NOTICE 'sequence % -> %', v_table_owner, v_app_user;
  END LOOP;

  -- 4. Đảm bảo app user có CREATE trên schema public (cần cho CREATE TYPE)
  EXECUTE format('GRANT CREATE ON SCHEMA public TO %I', v_app_user);

  -- 5. Đảm bảo app user có quyền USAGE trên public (cần cho SELECT/INSERT/UPDATE)
  EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', v_app_user);
END
$body$;

-- Verify
SELECT 'order_leaders.owner' AS what, tableowner AS value
FROM pg_tables WHERE schemaname='public' AND tablename='order_leaders'
UNION ALL
SELECT 'enum.owner',
  (SELECT t.typowner::regrole::text FROM pg_type t WHERE t.typname='order_leaders_type_enum')
WHERE EXISTS (SELECT 1 FROM pg_type WHERE typname='order_leaders_type_enum');