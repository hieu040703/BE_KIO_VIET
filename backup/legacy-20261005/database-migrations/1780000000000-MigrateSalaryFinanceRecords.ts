import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Chuẩn hóa dữ liệu lương cũ từng được lưu dưới type EXPENSE.
 */
export class MigrateSalaryFinanceRecords1780000000000 implements MigrationInterface {
  name = "MigrateSalaryFinanceRecords1780000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "finances"
      SET "type" = 'SALARY', "isDebtRelated" = false
      WHERE "type" = 'EXPENSE'
        AND "timeKeepingConfirmId" IS NOT NULL
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Cannot safely revert migrated salary Finance records because new SALARY records may use the same relation.",
    );
  }
}
