import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderCalculationVersions1778500000000 implements MigrationInterface {
  name = "AddOrderCalculationVersions1778500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "calculationVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "calculatedVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_pending_calculation" ON "orders" ("calculationVersion", "calculatedVersion") WHERE "deletedAt" IS NULL AND "calculationVersion" > "calculatedVersion"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_orders_pending_calculation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "calculatedVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "calculationVersion"`,
    );
  }
}
