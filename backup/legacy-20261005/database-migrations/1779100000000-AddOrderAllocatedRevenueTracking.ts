import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOrderAllocatedRevenueTracking1779100000000 implements MigrationInterface {
  name = "AddOrderAllocatedRevenueTracking1779100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("orders", "hasAllocatedRevenue"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "hasAllocatedRevenue",
          type: "boolean",
          default: false,
          isNullable: false,
        }),
      );
    }

    await queryRunner.query(
      `ALTER TYPE "time_keepings_otheramounttype_enum" ADD VALUE IF NOT EXISTS 'REFERRER_ORDER'`,
    );
    await queryRunner.query(
      `ALTER TYPE "time_keepings_otheramounttype_enum" ADD VALUE IF NOT EXISTS 'CREATE_ORDER'`,
    );
    await queryRunner.query(
      `ALTER TYPE "time_keepings_otheramounttype_enum" ADD VALUE IF NOT EXISTS 'ALLOCATED_REVENUE_ORDER'`,
    );

    // Dữ liệu thưởng giới thiệu cũ dùng BONUS; chuyển sang loại riêng để
    // các job/luồng mới không nhầm với thưởng tạo đơn hoặc phân bổ doanh thu.
    await queryRunner.query(
      `UPDATE "time_keepings"
       SET "otherAmountType" = 'REFERRER_ORDER'
       WHERE "referrerOrderId" IS NOT NULL
         AND "otherAmountType" = 'BONUS'`,
    );
    await queryRunner.query(
      `UPDATE "orders" AS orders
       SET "isReferrerPaid" = true
       WHERE EXISTS (
         SELECT 1
         FROM "time_keepings" AS timeKeepings
         WHERE timeKeepings."referrerOrderId" = orders."id"
           AND timeKeepings."otherAmountType" = 'REFERRER_ORDER'
           AND timeKeepings."isPaid" = true
       )`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Cannot drop order reward enum values on PostgreSQL. Recreate time_keepings_otheramounttype_enum manually if rollback is required.",
    );
  }
}
