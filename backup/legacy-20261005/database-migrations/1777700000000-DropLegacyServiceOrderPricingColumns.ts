import { MigrationInterface, QueryRunner } from "typeorm";

export class DropLegacyServiceOrderPricingColumns1777700000000 implements MigrationInterface {
  name = "DropLegacyServiceOrderPricingColumns1777700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const column of [
      "urgentSurchargePercent",
      "urgentSurchargeAmount",
      "fragileItemSurchargePercent",
      "fragileItemSurchargeAmount",
      "isUsePoints",
      "usedPoints",
      "pointsDiscountAmount",
      "voucherDiscountAmount",
      "discountedPrice",
    ]) {
      await queryRunner.query(`ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "${column}"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "urgentSurchargePercent" double precision NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "urgentSurchargeAmount" decimal(15,2) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "fragileItemSurchargePercent" double precision NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "fragileItemSurchargeAmount" decimal(15,2) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "isUsePoints" boolean NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "usedPoints" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "pointsDiscountAmount" decimal(15,2) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "voucherDiscountAmount" decimal(15,2) NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "discountedPrice" decimal(15,2) NULL DEFAULT NULL`,
    );
  }
}
