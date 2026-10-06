import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEstimatedCompletionAndCustomerPhoneToOrders1780400000000 implements MigrationInterface {
  name = "AddEstimatedCompletionAndCustomerPhoneToOrders1780400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("orders", "estimatedCompletionAt"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "estimatedCompletionAt",
          type: "timestamp with time zone",
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn("orders", "customerPhone"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "customerPhone",
          type: "varchar",
          length: "50",
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("orders", "customerPhone")) {
      await queryRunner.dropColumn("orders", "customerPhone");
    }
    if (await queryRunner.hasColumn("orders", "estimatedCompletionAt")) {
      await queryRunner.dropColumn("orders", "estimatedCompletionAt");
    }
  }
}
