import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBreakTimeToOrderEmployees1777400000000 implements MigrationInterface {
  name = "AddBreakTimeToOrderEmployees1777400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      ADD COLUMN IF NOT EXISTS "breakTime" double precision NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      DROP COLUMN IF EXISTS "breakTime"
    `);
  }
}
