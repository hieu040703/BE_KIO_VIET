import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServiceOrderChatParticipants1776400000000 implements MigrationInterface {
  name = "CreateServiceOrderChatParticipants1776400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_order_chat_participants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "serviceOrderId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "addedByUserId" uuid DEFAULT NULL,
        CONSTRAINT "PK_service_order_chat_participants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_socp_serviceOrder" FOREIGN KEY ("serviceOrderId")
          REFERENCES "service_orders" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_socp_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_socp_addedBy" FOREIGN KEY ("addedByUserId")
          REFERENCES "users" ("id") ON DELETE SET NULL
      )
    `);

    // Unique index: mỗi user chỉ được thêm 1 lần vào 1 cuộc hội thoại (khi chưa bị xóa)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_service_order_chat_participants_active"
      ON "service_order_chat_participants" ("serviceOrderId", "userId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_chat_participants_serviceOrderId"
      ON "service_order_chat_participants" ("serviceOrderId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_chat_participants_serviceOrderId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_chat_participants_active"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_order_chat_participants"`);
  }
}
