import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToServicePrices1776900000000 implements MigrationInterface {
  name = "AddFieldsToServicePrices1776900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_prices" ADD COLUMN IF NOT EXISTS "unit" varchar`);
    await queryRunner.query(
      `ALTER TABLE "service_prices" ADD COLUMN IF NOT EXISTS "quantity" numeric(15,2) DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_prices" ADD COLUMN IF NOT EXISTS "excessUnitPrice" numeric(15,2) DEFAULT 0`,
    );

    await queryRunner.query(`UPDATE "service_prices" SET "unit" = COALESCE("unit", '')`);
    await queryRunner.query(`UPDATE "service_prices" SET "quantity" = COALESCE("quantity", 0)`);
    await queryRunner.query(
      `UPDATE "service_prices" SET "excessUnitPrice" = COALESCE("excessUnitPrice", 0)`,
    );

    await queryRunner.query(`ALTER TABLE "service_prices" ALTER COLUMN "unit" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "service_prices" ALTER COLUMN "quantity" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "service_prices" ALTER COLUMN "excessUnitPrice" SET NOT NULL`);

    await queryRunner.query(`ALTER TABLE "service_prices" ALTER COLUMN "quantity" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "service_prices" ALTER COLUMN "excessUnitPrice" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "service_prices" DROP COLUMN IF EXISTS "excessUnitPrice"`);
    await queryRunner.query(`ALTER TABLE "service_prices" DROP COLUMN IF EXISTS "quantity"`);
    await queryRunner.query(`ALTER TABLE "service_prices" DROP COLUMN IF EXISTS "unit"`);
  }
}
