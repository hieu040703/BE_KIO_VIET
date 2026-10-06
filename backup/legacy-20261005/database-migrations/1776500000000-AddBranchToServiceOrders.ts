import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchToServiceOrders1776500000000 implements MigrationInterface {
  name = "AddBranchToServiceOrders1776500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_orders"
      ADD COLUMN IF NOT EXISTS "branchId" uuid DEFAULT NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_service_orders_branch'
        ) THEN
          ALTER TABLE "service_orders"
          ADD CONSTRAINT "FK_service_orders_branch"
          FOREIGN KEY ("branchId") REFERENCES "branches" ("id") ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_orders_branchId"
      ON "service_orders" ("branchId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_orders_branchId"`);
    await queryRunner.query(`ALTER TABLE "service_orders" DROP CONSTRAINT IF EXISTS "FK_service_orders_branch"`);
    await queryRunner.query(`ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "branchId"`);
  }
}
