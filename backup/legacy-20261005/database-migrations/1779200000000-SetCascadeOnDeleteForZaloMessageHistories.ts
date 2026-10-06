import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Cho phép xóa cứng đơn hàng có lịch sử gửi Zalo.
 *
 * Database hiện tại có thể đã tạo FK với tên hash khác nhau, vì vậy migration
 * tìm và thay thế tất cả FK trên `zalo_message_histories.orderId` trỏ tới
 * `orders.id` thay vì phụ thuộc vào một tên constraint cố định.
 */
export class SetCascadeOnDeleteForZaloMessageHistories1779200000000 implements MigrationInterface {
  name = "SetCascadeOnDeleteForZaloMessageHistories1779200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("zalo_message_histories"))) {
      return;
    }

    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        FOR constraint_name IN
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_namespace rel_namespace ON rel_namespace.oid = rel.relnamespace
          JOIN pg_class parent_rel ON parent_rel.oid = con.confrelid
          JOIN pg_namespace parent_namespace ON parent_namespace.oid = parent_rel.relnamespace
          JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
          WHERE rel.relname = 'zalo_message_histories'
            AND rel_namespace.nspname = 'public'
            AND parent_rel.relname = 'orders'
            AND parent_namespace.nspname = 'public'
            AND con.contype = 'f'
            AND att.attname = 'orderId'
        LOOP
          EXECUTE format(
            'ALTER TABLE "zalo_message_histories" DROP CONSTRAINT IF EXISTS %I',
            constraint_name
          );
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_zalo_message_histories_order'
        ) THEN
          ALTER TABLE "zalo_message_histories"
          ADD CONSTRAINT "FK_zalo_message_histories_order"
          FOREIGN KEY ("orderId")
          REFERENCES "orders"("id")
          ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("zalo_message_histories"))) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "zalo_message_histories"
      DROP CONSTRAINT IF EXISTS "FK_zalo_message_histories_order"
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_zalo_message_histories_order'
        ) THEN
          ALTER TABLE "zalo_message_histories"
          ADD CONSTRAINT "FK_zalo_message_histories_order"
          FOREIGN KEY ("orderId")
          REFERENCES "orders"("id")
          ON DELETE NO ACTION;
        END IF;
      END $$;
    `);
  }
}
