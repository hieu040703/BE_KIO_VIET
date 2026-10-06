import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Thêm loại Attribute dùng cho danh sách chuyên môn của nhân viên.
 * PostgreSQL không hỗ trợ xoá riêng một giá trị enum an toàn, nên migration
 * không thể rollback tự động phần enum này.
 */
export class AddEmployeeExpertiseAttributeType1778550000000 implements MigrationInterface {
  name = "AddEmployeeExpertiseAttributeType1778550000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "attributes_type_enum" ADD VALUE IF NOT EXISTS 'EMPLOYEE_EXPERTISE'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Cannot drop enum value 'EMPLOYEE_EXPERTISE' on PostgreSQL. Recreate attributes_type_enum manually if rollback is required.",
    );
  }
}
