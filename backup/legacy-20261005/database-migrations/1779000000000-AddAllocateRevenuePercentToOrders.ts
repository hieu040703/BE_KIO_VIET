import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAllocateRevenuePercentToOrders1779000000000 implements MigrationInterface {
  name = "AddAllocateRevenuePercentToOrders1779000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("orders", "allocateRevenuePercent")) {
      return;
    }

    await queryRunner.addColumn(
      "orders",
      new TableColumn({
        name: "allocateRevenuePercent",
        type: "double precision",
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("orders", "allocateRevenuePercent")) {
      await queryRunner.dropColumn("orders", "allocateRevenuePercent");
    }
  }
}
