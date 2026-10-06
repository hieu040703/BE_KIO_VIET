import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Index cho các bảng con phục vụ danh sách đơn hàng (GET /orders).
 *
 * Bối cảnh (đo thực tế trên DB test, 6976 đơn):
 * - `OrderRepository.extendQueryBuilder` thêm 4 subquery tương quan/row
 *   (totalIncomeAmount, unreadCommentCount, isAllEmployeeConfirmed, latestComment).
 * - Các bảng con chỉ có PK trên `id`, KHÔNG có index trên `orderId` →
 *   mỗi subquery seq-scan bảng 100k+ dòng cho từng đơn.
 * - Kết quả EXPLAIN ANALYZE: 4 subquery ~212ms (cache nóng), là ~93% thời gian
 *   của bước lấy data. Index `orderId` biến seq-scan → index lookup.
 *
 * ⚠️ VẬN HÀNH:
 * - Các bảng finances/order_comments/view_comments/order_employees/order_details/orders
 *   thuộc owner `postgres`. Migration này PHẢI chạy bằng role owner (postgres) —
 *   app user thường không phải owner nên sẽ báo `must be owner of table`.
 * - Migration chạy trong transaction (mode mặc định "all") nên KHÔNG dùng
 *   CONCURRENTLY ở đây. Với production zero-downtime, chạy tay script
 *   `BE/scripts/order-list-indexes.concurrent.sql` (CREATE INDEX CONCURRENTLY)
 *   trước, rồi migration này sẽ no-op nhờ IF NOT EXISTS.
 * - CREATE INDEX thường (non-concurrent) khoá ghi trên bảng vài giây khi build —
 *   nên chạy lúc off-peak nếu áp dụng migration trực tiếp lên prod.
 */
export class AddOrderListChildIndexes1778300000000 implements MigrationInterface {
  name = "AddOrderListChildIndexes1778300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // totalIncomeAmount + extendSummaryFields.totalAmount + getTotalIncomeByOrderId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_finances_order_type"
      ON "finances" ("orderId", "type")
    `);

    // isAllEmployeeConfirmed + filter salary IS NULL
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_employees_active_order"
      ON "order_employees" ("orderId")
      WHERE "deletedAt" IS NULL
    `);

    // latestComment (ORDER BY createdAt DESC LIMIT 1) + subquery IN(order_comments theo orderId)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_comments_active_order_created"
      ON "order_comments" ("orderId", "createdAt" DESC)
      WHERE "deletedAt" IS NULL
    `);

    // unreadCommentCount: lọc theo user + chưa đọc + orderCommentId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_view_comments_unread_user_oc"
      ON "view_comments" ("userId", "orderCommentId")
      WHERE "isViewed" = false
    `);

    // join orderLeaders + EXISTS role-filter theo orderId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_leaders_active_order"
      ON "order_leaders" ("orderId")
      WHERE "deletedAt" IS NULL
    `);

    // join orderDetails theo orderId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_details_active_order"
      ON "order_details" ("orderId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_details_active_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_leaders_active_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_view_comments_unread_user_oc"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_comments_active_order_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_employees_active_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_finances_order_type"`);
  }
}
