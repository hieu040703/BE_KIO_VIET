import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStartNotificationSentAtToServiceOrders1777300000000 implements MigrationInterface {
  name = "AddOrderStartNotificationSentAtToServiceOrders1777300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_orders"
      ADD COLUMN IF NOT EXISTS "orderStartNotificationSentAt" TIMESTAMP WITH TIME ZONE NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_orders"
      DROP COLUMN IF EXISTS "orderStartNotificationSentAt"
    `);
  }
}
