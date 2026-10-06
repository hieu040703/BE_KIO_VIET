import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Thêm loại Finance SALARY cho khoản chi lương nhân viên.
 */
export class AddSalaryToFinanceTypeEnum1779900000000 implements MigrationInterface {
  name = "AddSalaryToFinanceTypeEnum1779900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "finances_type_enum" ADD VALUE IF NOT EXISTS 'SALARY'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Cannot drop enum value 'SALARY' on PostgreSQL. Recreate finances_type_enum manually if rollback is required.",
    );
  }
}
