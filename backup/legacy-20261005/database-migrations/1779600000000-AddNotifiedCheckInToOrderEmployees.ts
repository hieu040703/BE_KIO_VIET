import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifiedCheckInToOrderEmployees1779600000000 implements MigrationInterface {
  name = "AddNotifiedCheckInToOrderEmployees1779600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      ADD COLUMN IF NOT EXISTS "hasNotifiedCheckIn" boolean DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      DROP COLUMN IF EXISTS "hasNotifiedCheckIn"
    `);
  }
}
