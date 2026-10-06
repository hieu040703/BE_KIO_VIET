import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCodeToServiceOrders1776700000000 implements MigrationInterface {
  name = "AddCodeToServiceOrders1776700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_orders"
      ADD COLUMN IF NOT EXISTS "code" varchar(50)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_orders_code"
      ON "service_orders" ("code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_orders_code"`);
    await queryRunner.query(`ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "code"`);
  }
}
