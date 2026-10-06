import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Thêm value `MARGIN` vào Postgres enum `finances_type_enum` để khớp với
 * FE `FinanceTypeEnum.MARGIN` (xem BE/src/shared/constants/constance.ts).
 *
 * Lưu ý Postgres:
 * - `ALTER TYPE ... ADD VALUE` KHÔNG thể chạy trong transaction block ở PG < 12.
 * - Dùng `IF NOT EXISTS` (PG 9.6+) để idempotent.
 * - Không có rollback: Postgres không hỗ trợ DROP VALUE trong PG < 12,
 *   nên `down()` chỉ log warning thay vì throw.
 */
export class AddMarginToFinanceTypeEnum1777100000000 implements MigrationInterface {
  name = "AddMarginToFinanceTypeEnum1777100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "finances_type_enum" ADD VALUE IF NOT EXISTS 'MARGIN'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Postgres < 12 không hỗ trợ DROP VALUE cho enum.
    // Throwing (không warn) để CI/dev biết rollback thất bại thay vì
    // silently "success" mà DB vẫn có value mới. Recreate type manual nếu cần:
    //   1. CREATE TYPE finances_type_enum_old AS ENUM (old_values...);
    //   2. ALTER TABLE finances ALTER COLUMN type TYPE finances_type_enum_old USING type::text::finances_type_enum_old;
    //   3. DROP TYPE finances_type_enum;
    throw new Error(
      "Cannot drop enum value 'MARGIN' on Postgres < 12. See migration file for manual rollback steps.",
    );
  }
}
