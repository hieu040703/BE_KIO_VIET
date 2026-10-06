import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Cleanup các FK constraint cũ (đặt tên thân thiện / hash cũ) trên column
 * `branchManagerId` của `service_orders` và `orders` sau khi đã rename từ
 * `teamLeaderId` ở migration 1777900000000.
 *
 * Việc drop các FK cũ là cần thiết vì:
 * - Các migration trước đó tạo FK với tên cũ (vd `FK_3114d7bcc...` hoặc
 *   `FK_service_orders_branchManagerId`), tên này không khớp với entity
 *   metadata mới của TypeORM.
 * - Sau khi drop, FK sẽ được tạo lại với tên TypeORM hash đúng khi chạy
 *   `yarn db:sync` (dev) hoặc generate migration FK mới.
 *
 * Idempotent — không lỗi nếu FK đã được drop trước đó.
 */
export class CleanupServiceOrderTeamLeaderFk1778000000000 implements MigrationInterface {
  name = "CleanupServiceOrderTeamLeaderFk1778000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await dropForeignKeysOnColumn(queryRunner, "service_orders", "branchManagerId");
    await dropForeignKeysOnColumn(queryRunner, "orders", "branchManagerId");
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Down không restore FK cũ — chỉ cần revert là tạo lại bằng
    // `yarn db:sync` hoặc generate migration mới. Nếu rollback, chạy
    // ngược migration rename (1777900000000) sẽ không cần FK cũ.
  }
}

async function dropForeignKeysOnColumn(
  queryRunner: QueryRunner,
  tableName: string,
  columnName: string,
): Promise<void> {
  // Tìm FK constraint dựa trên conkey (mảng column attnum) join với
  // pg_attribute để biết chính xác column name. Robust hơn ILIKE pattern.
  const fks: Array<{ conname: string }> = await queryRunner.query(
    `SELECT c.conname
     FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     JOIN pg_namespace n ON n.oid = t.relnamespace
     JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
     WHERE t.relname = $1
       AND n.nspname = 'public'
       AND c.contype = 'f'
       AND a.attname = $2`,
    [tableName, columnName],
  );
  for (const row of fks) {
    await queryRunner.query(
      `ALTER TABLE "${tableName}" DROP CONSTRAINT "${row.conname}"`,
    );
  }
}
