import { MigrationInterface, QueryRunner } from "typeorm";
import { TableForeignKey, TableColumn } from "typeorm";

/**
 * Đổi `service_orders.teamLeaderId` thành `branchManagerId` để đồng bộ với
 * `Order.branchManagerId` (cùng ngữ nghĩa: "quản lý chi nhánh phụ trách đơn").
 *
 * Lý do đổi tên:
 * - `teamlead` (trưởng nhóm) không còn đúng ngữ nghĩa — giờ là quản lý chi nhánh
 *   (cấp cao hơn, dùng để phân quyền xem đơn theo chi nhánh).
 * - `Order` đã dùng `branchManagerId` từ trước, tránh để 2 entity dùng 2 tên
 *   khác nhau cho cùng một vai trò.
 *
 * Đồng thời tạo FK constraint cho `orders.branchManagerId` (cột đã có sẵn
 * trong DB do migration Order tạo từ trước, nhưng FK constraint chưa được
 * generate đúng theo entity).
 *
 * Dùng TypeORM API (renameColumn / dropForeignKey / createForeignKey) để
 * TypeORM tự generate constraint name theo hash của entity metadata — tránh
 * hardcode tên constraint dễ lệch.
 */
export class RenameTeamLeaderIdToBranchManagerId1777900000000 implements MigrationInterface {
  name = "RenameTeamLeaderIdToBranchManagerId1777900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. service_orders: nếu còn cột teamLeaderId thì rename sang branchManagerId
    //    bằng raw SQL (dùng queryRunner.renameColumn sẽ cố rename luôn FK
    //    constraint theo tên cũ → conflict vì có nhiều FK trên cùng cột).
    const hasOldColumn = await queryRunner.hasColumn("service_orders", "teamLeaderId");
    const hasNewColumn = await queryRunner.hasColumn("service_orders", "branchManagerId");

    if (hasOldColumn && !hasNewColumn) {
      await queryRunner.query(
        `ALTER TABLE "service_orders" RENAME COLUMN "teamLeaderId" TO "branchManagerId"`,
      );
    }

    // 2. service_orders: drop TẤT CẢ FK cũ trên column branchManagerId
    //    (kể cả FK cũ tên thân thiện như "FK_service_orders_branchManagerId"
    //    hay tên hash cũ từ lần apply trước) để TypeORM tự generate lại FK
    //    mới với tên đúng khi chạy `yarn db:sync` hoặc generate migration
    //    mới cho riêng FK.
    await dropForeignKeysOnColumn(queryRunner, "service_orders", "branchManagerId");

    // 3. orders: drop TẤT CẢ FK cũ trên column branchManagerId
    await dropForeignKeysOnColumn(queryRunner, "orders", "branchManagerId");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasOldColumn = await queryRunner.hasColumn("service_orders", "teamLeaderId");
    const hasNewColumn = await queryRunner.hasColumn("service_orders", "branchManagerId");

    if (hasNewColumn && !hasOldColumn) {
      await queryRunner.query(
        `ALTER TABLE "service_orders" RENAME COLUMN "branchManagerId" TO "teamLeaderId"`,
      );
    }
  }
}

/**
 * Helper: drop TẤT CẢ foreign key constraint trên column `columnName`
 * của table `tableName` (idempotent — không lỗi nếu không có FK nào).
 */
async function dropForeignKeysOnColumn(
  queryRunner: QueryRunner,
  tableName: string,
  columnName: string,
): Promise<void> {
  const relid = `public.${tableName}`;
  const fks: Array<{ conname: string }> = await queryRunner.query(
    `SELECT conname FROM pg_constraint
     WHERE conrelid = $1::regclass
       AND contype = 'f'
       AND pg_get_constraintdef(oid) ILIKE $2`,
    [relid, `%(${columnName})%`],
  );
  for (const row of fks) {
    await queryRunner.query(
      `ALTER TABLE "${tableName}" DROP CONSTRAINT "${row.conname}"`,
    );
  }
}
