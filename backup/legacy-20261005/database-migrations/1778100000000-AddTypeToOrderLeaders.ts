import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Thêm cột `type` (enum) vào bảng `order_leaders` để đồng bộ với entity
 * `OrderLeader.type` mới được thêm vào (giá trị: 'branch_manager' | 'accountant').
 *
 * Đồng thời chuyển ownership của bảng về `current_user` nếu đang khác,
 * để các migration sau (và `yarn db:sync`) không còn lỗi
 * "must be owner of table order_leaders" khi kết nối bằng user
 * application thay vì `postgres` superuser.
 *
 * Step:
 *   1. (best-effort) ALTER TABLE order_leaders OWNER TO current_user
 *      — nếu user chạy migration không phải superuser cũng không phải owner
 *      hiện tại, bước này sẽ emit NOTICE nhưng KHÔNG abort transaction.
 *      Lúc đó bước 3 bên dưới sẽ fail với "must be owner"; user cần grant
 *      ownership thủ công một lần rồi chạy lại migration:
 *        psql -U postgres -d <db> -c "ALTER TABLE public.order_leaders OWNER TO <app_user>;"
 *   2. CREATE TYPE order_leaders_type_enum (idempotent).
 *   3. ALTER TABLE order_leaders ADD COLUMN "type" ... (idempotent).
 *
 * Idempotent — chạy lại nhiều lần không lỗi.
 */
export class AddTypeToOrderLeaders1778100000000 implements MigrationInterface {
  name = "AddTypeToOrderLeaders1778100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Best-effort: chuyển ownership về current_user.
    //    Dùng DO block để bắt insufficient_privilege thay vì abort cả transaction,
    //    để user vẫn thấy được thông báo hướng dẫn khi thiếu quyền.
    await queryRunner.query(`
      DO $body$
      DECLARE
        v_owner text;
      BEGIN
        SELECT tableowner INTO v_owner
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'order_leaders';

        IF v_owner IS NULL THEN
          RAISE NOTICE 'order_leaders table not found in public schema — skipping ownership transfer';
        ELSIF v_owner = current_user THEN
          RAISE NOTICE 'order_leaders already owned by % — skipping ownership transfer', current_user;
        ELSE
          BEGIN
            EXECUTE format('ALTER TABLE public.order_leaders OWNER TO %I', current_user);
            RAISE NOTICE 'Transferred order_leaders ownership: % -> %', v_owner, current_user;
          EXCEPTION
            WHEN insufficient_privilege THEN
              RAISE NOTICE 'Cannot transfer order_leaders ownership from % to % (insufficient privilege). Run once as superuser: psql -U postgres -d % -c "ALTER TABLE public.order_leaders OWNER TO %;"', v_owner, current_user, current_database(), current_user;
            WHEN OTHERS THEN
              RAISE NOTICE 'Ownership transfer skipped: %', SQLERRM;
          END;
        END IF;
      END
      $body$;
    `);

    // 2. Tạo enum nếu chưa có — bám sát tên mà TypeORM generate từ entity
    //    (`@Column({ type: 'enum', enum: [...] })` → `<table>_<col>_enum`).
    await queryRunner.query(`
      DO $body$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'order_leaders_type_enum'
        ) THEN
          CREATE TYPE "order_leaders_type_enum" AS ENUM (
            'branch_manager',
            'accountant'
          );
        END IF;
      END
      $body$;
    `);

    // 3. Thêm cột `type` nếu chưa có — nullable để khớp entity.
    await queryRunner.query(`
      ALTER TABLE "order_leaders"
      ADD COLUMN IF NOT EXISTS "type" "order_leaders_type_enum" DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_leaders" DROP COLUMN IF EXISTS "type"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "order_leaders_type_enum"
    `);
  }
}