import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendCallHistories1780600000000 implements MigrationInterface {
  name = "ExtendCallHistories1780600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo enum mới thay vì ADD VALUE rồi dùng ngay trong cùng transaction;
    // PostgreSQL có thể chưa cho phép tham chiếu enum value vừa thêm trước khi
    // transaction commit.
    await queryRunner.query(`
      CREATE TYPE "call_histories_calltype_enum_new" AS ENUM ('OUTGOING', 'INCOMING', 'ATA', 'PTP')
    `);

    // Các bản ghi cũ chỉ có OUTGOING/INCOMING. Phân loại ATA khi cả hai đầu
    // cuộc gọi đều gắn với tài khoản nhân viên; các bản ghi còn lại là PTP.
    await queryRunner.query(`
      ALTER TABLE "call_histories"
      ALTER COLUMN "callType" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "call_histories"
      ALTER COLUMN "callerId" DROP NOT NULL,
      ALTER COLUMN "receiverId" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "call_histories"
      ALTER COLUMN "callType" TYPE "call_histories_calltype_enum_new"
      USING "callType"::text::"call_histories_calltype_enum_new"
    `);
    await queryRunner.query(`
      DROP TYPE "call_histories_calltype_enum"
    `);
    await queryRunner.query(`
      ALTER TYPE "call_histories_calltype_enum_new" RENAME TO "call_histories_calltype_enum"
    `);

    await queryRunner.query(`
      UPDATE "call_histories" AS history
      SET "callType" = CASE
        WHEN EXISTS (
          SELECT 1
          FROM "users" AS caller
          WHERE caller."id" = history."callerId"
            AND caller."employeeId" IS NOT NULL
        )
        AND EXISTS (
          SELECT 1
          FROM "users" AS receiver
          WHERE receiver."id" = history."receiverId"
            AND receiver."employeeId" IS NOT NULL
        )
        THEN 'ATA'::"call_histories_calltype_enum"
        ELSE 'PTP'::"call_histories_calltype_enum"
      END
      WHERE "callType" IN ('OUTGOING', 'INCOMING')
    `);
    await queryRunner.query(`
      ALTER TABLE "call_histories"
      ALTER COLUMN "callType" SET DEFAULT 'PTP'
    `);

    await queryRunner.query(`
      ALTER TABLE "call_histories"
      ADD COLUMN IF NOT EXISTS "orderId" uuid DEFAULT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_call_histories_orderId"
      ON "call_histories" ("orderId")
      WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_call_histories_order'
        ) THEN
          ALTER TABLE "call_histories"
          ADD CONSTRAINT "FK_call_histories_order"
          FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "call_histories" DROP CONSTRAINT IF EXISTS "FK_call_histories_order"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_call_histories_orderId"`);
    await queryRunner.query(`ALTER TABLE "call_histories" DROP COLUMN IF EXISTS "orderId"`);
    // PostgreSQL không hỗ trợ xoá riêng một enum value an toàn khi dữ liệu
    // hoặc schema khác còn tham chiếu tới enum đó.
  }
}
