import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Thêm chức vụ cộng tác viên vào enum chức vụ của nhân viên.
 * PostgreSQL không hỗ trợ xoá riêng enum value an toàn nên down() chỉ báo lỗi.
 */
export class AddCollaboratorsToEmployeePositionEnum1778650000000 implements MigrationInterface {
  name = "AddCollaboratorsToEmployeePositionEnum1778650000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "employees_position_enum" ADD VALUE IF NOT EXISTS 'Cộng tác viên'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Cannot drop enum value 'Cộng tác viên' on PostgreSQL. Recreate employees_position_enum manually if rollback is required.",
    );
  }
}
