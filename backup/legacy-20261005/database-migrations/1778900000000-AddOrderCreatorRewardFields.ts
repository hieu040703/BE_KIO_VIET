import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddOrderCreatorRewardFields1778900000000 implements MigrationInterface {
  name = "AddOrderCreatorRewardFields1778900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("orders", "createdByEmployeeId"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "createdByEmployeeId",
          type: "uuid",
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn("orders", "createdByEmployeePercent"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "createdByEmployeePercent",
          type: "double precision",
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn("orders", "isPaidForEmployeeCreateOrder"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "isPaidForEmployeeCreateOrder",
          type: "boolean",
          default: false,
          isNullable: false,
        }),
      );
    }

    const table = await queryRunner.getTable("orders");
    const hasCreatorForeignKey = table?.foreignKeys.some((foreignKey) =>
      foreignKey.columnNames.includes("createdByEmployeeId"),
    );

    if (table && !hasCreatorForeignKey) {
      await queryRunner.createForeignKey(
        table,
        new TableForeignKey({
          name: "FK_orders_createdByEmployeeId",
          columnNames: ["createdByEmployeeId"],
          referencedTableName: "employees",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("orders");
    const creatorForeignKey = table?.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes("createdByEmployeeId"),
    );

    if (table && creatorForeignKey) {
      await queryRunner.dropForeignKey(table, creatorForeignKey);
    }

    if (await queryRunner.hasColumn("orders", "isPaidForEmployeeCreateOrder")) {
      await queryRunner.dropColumn("orders", "isPaidForEmployeeCreateOrder");
    }
    if (await queryRunner.hasColumn("orders", "createdByEmployeePercent")) {
      await queryRunner.dropColumn("orders", "createdByEmployeePercent");
    }
    if (await queryRunner.hasColumn("orders", "createdByEmployeeId")) {
      await queryRunner.dropColumn("orders", "createdByEmployeeId");
    }
  }
}
