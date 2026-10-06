import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class RemoveEmployeeFromOrders1780300000000 implements MigrationInterface {
  name = "RemoveEmployeeFromOrders1780300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("orders", "employeeId"))) {
      return;
    }

    // Giữ lại nhân viên đầu cánh cũ trong bảng nhân sự của hợp đồng trước khi bỏ cột cũ.
    await queryRunner.query(`
      UPDATE "order_employees" AS "orderEmployee"
      SET "isLeader" = true,
          "updatedAt" = NOW()
      FROM "orders" AS "order"
      WHERE "orderEmployee"."orderId" = "order"."id"
        AND "orderEmployee"."employeeId" = "order"."employeeId"
        AND "orderEmployee"."deletedAt" IS NULL
        AND "order"."employeeId" IS NOT NULL
    `);

    await queryRunner.query(`
      INSERT INTO "order_employees" (
        "id", "orderId", "employeeId", "isLeader", "createdAt", "updatedAt"
      )
      SELECT uuid_generate_v4(), "order"."id", "order"."employeeId", true, NOW(), NOW()
      FROM "orders" AS "order"
      WHERE "order"."employeeId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "order_employees" AS "orderEmployee"
          WHERE "orderEmployee"."orderId" = "order"."id"
            AND "orderEmployee"."employeeId" = "order"."employeeId"
            AND "orderEmployee"."deletedAt" IS NULL
        )
    `);

    await queryRunner.dropColumn("orders", "employeeId");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("orders", "employeeId"))) {
      await queryRunner.addColumn(
        "orders",
        new TableColumn({
          name: "employeeId",
          type: "uuid",
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      UPDATE "orders" AS "order"
      SET "employeeId" = "fieldLeader"."employeeId"
      FROM (
        SELECT DISTINCT ON ("orderId") "orderId", "employeeId"
        FROM "order_employees"
        WHERE "isLeader" = true
          AND "deletedAt" IS NULL
        ORDER BY "orderId", "createdAt" ASC, "id" ASC
      ) AS "fieldLeader"
      WHERE "fieldLeader"."orderId" = "order"."id"
    `);

    const table = await queryRunner.getTable("orders");
    const hasEmployeeForeignKey = table?.foreignKeys.some((foreignKey) =>
      foreignKey.columnNames.includes("employeeId"),
    );

    if (table && !hasEmployeeForeignKey) {
      await queryRunner.createForeignKey(
        table,
        new TableForeignKey({
          name: "FK_orders_employeeId",
          columnNames: ["employeeId"],
          referencedTableName: "employees",
          referencedColumnNames: ["id"],
          onDelete: "NO ACTION",
        }),
      );
    }
  }
}
