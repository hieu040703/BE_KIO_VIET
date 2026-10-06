import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddOrderCompletionConfirmationFields1780100000000 implements MigrationInterface {
  name = "AddOrderCompletionConfirmationFields1780100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("orders", "completedByEmployeeId"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "completedByEmployeeId",
          type: "uuid",
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn("orders", "completedAt"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "completedAt",
          type: "timestamp with time zone",
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable("orders");
    const hasCompletionEmployeeForeignKey = table?.foreignKeys.some(
      (foreignKey) => foreignKey.columnNames.includes("completedByEmployeeId"),
    );

    if (table && !hasCompletionEmployeeForeignKey) {
      await queryRunner.createForeignKey(
        table,
        new TableForeignKey({
          name: "FK_orders_completedByEmployeeId",
          columnNames: ["completedByEmployeeId"],
          referencedTableName: "employees",
          referencedColumnNames: ["id"],
          onDelete: "SET NULL",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("orders");
    const completionEmployeeForeignKey = table?.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes("completedByEmployeeId"),
    );

    if (table && completionEmployeeForeignKey) {
      await queryRunner.dropForeignKey(table, completionEmployeeForeignKey);
    }

    if (await queryRunner.hasColumn("orders", "completedAt")) {
      await queryRunner.dropColumn("orders", "completedAt");
    }
    if (await queryRunner.hasColumn("orders", "completedByEmployeeId")) {
      await queryRunner.dropColumn("orders", "completedByEmployeeId");
    }
  }
}
