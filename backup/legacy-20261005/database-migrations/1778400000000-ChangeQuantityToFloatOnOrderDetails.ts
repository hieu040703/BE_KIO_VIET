import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeQuantityToFloatOnOrderDetails1778400000000 implements MigrationInterface {
  name = "ChangeQuantityToFloatOnOrderDetails1778400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Đổi quantity từ integer sang double precision để hỗ trợ số thập phân (vd: 1.5 tấn)
    await queryRunner.query(
      `ALTER TABLE "order_details" ALTER COLUMN "quantity" TYPE double precision USING "quantity"::double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert về integer — mất phần thập phân (làm tròn)
    await queryRunner.query(
      `ALTER TABLE "order_details" ALTER COLUMN "quantity" TYPE integer USING "quantity"::integer`,
    );
  }
}
