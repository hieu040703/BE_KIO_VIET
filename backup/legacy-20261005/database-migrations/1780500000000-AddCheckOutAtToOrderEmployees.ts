import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCheckOutAtToOrderEmployees1780500000000 implements MigrationInterface {
  name = "AddCheckOutAtToOrderEmployees1780500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("order_employees", "checkOutAt"))) {
      await queryRunner.addColumn(
        "order_employees",
        new TableColumn({
          name: "checkOutAt",
          type: "timestamp with time zone",
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("order_employees", "checkOutAt")) {
      await queryRunner.dropColumn("order_employees", "checkOutAt");
    }
  }
}
