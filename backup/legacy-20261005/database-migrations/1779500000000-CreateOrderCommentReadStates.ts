import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Thay thế bảng "view_comments" (1 dòng/comment/user) bằng bảng
 * "order_comment_read_states" (checkpoint 1 dòng/order/user):
 * - Giảm write amplification: tạo comment không còn insert N dòng cho N user.
 * - Unread count tính bằng cách so sánh (timeAt, id) với checkpoint, dùng index.
 * - Backfill dữ liệu cũ: mỗi (orderId, userId) lấy comment đã xem mới nhất.
 */
export class CreateOrderCommentReadStates1779500000000 implements MigrationInterface {
  name = "CreateOrderCommentReadStates1779500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_comment_read_states" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "orderId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "lastReadCommentId" uuid DEFAULT NULL,
        CONSTRAINT "PK_order_comment_read_states" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_comment_read_states_order" FOREIGN KEY ("orderId")
          REFERENCES "orders" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_comment_read_states_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_comment_read_states_comment" FOREIGN KEY ("lastReadCommentId")
          REFERENCES "order_comments" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_order_comment_read_states_order_user"
      ON "order_comment_read_states" ("orderId", "userId")
      WHERE "deletedAt" IS NULL
    `);

    // Index phục vụ đếm unread: (orderId, timeAt, id) DESC
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_comments_active_order_time_id"
      ON "order_comments" ("orderId", "timeAt", "id")
      WHERE "deletedAt" IS NULL
    `);

    // Backfill: mỗi (orderId, userId) từng có viewComment đã xem
    // → tạo checkpoint tại comment đã xem mới nhất.
    // Giữ checkpoint đã tồn tại để migration có thể chạy tiếp sau lần chạy dở dang.
    await queryRunner.query(`
      INSERT INTO "order_comment_read_states" (
        "id", "tempId", "note", "createdAt", "updatedAt",
        "createdBy", "updatedBy", "deletedAt",
        "orderId", "userId", "lastReadCommentId"
      )
      SELECT DISTINCT ON (oc."orderId", vc."userId")
        uuid_generate_v4(), NULL, NULL, now(), now(),
        NULL, NULL, NULL,
        oc."orderId", vc."userId", vc."orderCommentId"
      FROM "view_comments" vc
      JOIN "order_comments" oc ON oc."id" = vc."orderCommentId" AND oc."deletedAt" IS NULL
      WHERE vc."isViewed" = true AND vc."deletedAt" IS NULL
      ORDER BY oc."orderId", vc."userId", oc."timeAt" DESC, oc."id" DESC
      ON CONFLICT ("orderId", "userId") WHERE "deletedAt" IS NULL DO NOTHING
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "view_comments"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tái tạo bảng cũ để rollback, backfill checkpoint đã có thành dòng đã xem.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "view_comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "orderCommentId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "isViewed" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_view_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_view_comments_order_comment" FOREIGN KEY ("orderCommentId")
          REFERENCES "order_comments" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_view_comments_active_order_created"
      ON "view_comments" ("orderCommentId", "userId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO "view_comments" (
        "id", "tempId", "note", "createdAt", "updatedAt",
        "createdBy", "updatedBy", "deletedAt",
        "orderCommentId", "userId", "isViewed"
      )
      SELECT uuid_generate_v4(), NULL, NULL, now(), now(),
        NULL, NULL, NULL,
        rsc."lastReadCommentId", rsc."userId", true
      FROM "order_comment_read_states" rsc
      WHERE rsc."lastReadCommentId" IS NOT NULL AND rsc."deletedAt" IS NULL
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_comments_active_order_time_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_comment_read_states"`);
  }
}
