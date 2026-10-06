import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsUrgentToOrders1779400000000 implements MigrationInterface {
  name = "AddIsUrgentToOrders1779400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "isUrgent" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "isUrgent"
    `);
  }
}
