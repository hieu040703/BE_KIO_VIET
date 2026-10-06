import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderLeaderChats1778800000000 implements MigrationInterface {
  name = "CreateOrderLeaderChats1778800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_leader_chats" (
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
        "replyMessageId" uuid DEFAULT NULL,
        "content" text DEFAULT NULL,
        "attachments" jsonb DEFAULT NULL,
        "timeAt" timestamp with time zone NOT NULL DEFAULT now(),
        "tags" uuid[] DEFAULT NULL,
        CONSTRAINT "PK_order_leader_chats" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_leader_chats_order" FOREIGN KEY ("orderId")
          REFERENCES "orders" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_leader_chats_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_order_leader_chats_reply" FOREIGN KEY ("replyMessageId")
          REFERENCES "order_leader_chats" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_leader_chats_active_order_time_id"
      ON "order_leader_chats" ("orderId", "timeAt", "id")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_leader_chats_active_order_user_time"
      ON "order_leader_chats" ("orderId", "userId", "timeAt")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_leader_chats_active_tags"
      ON "order_leader_chats" USING GIN ("tags")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_leader_chat_read_states" (
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
        "lastReadMessageId" uuid DEFAULT NULL,
        CONSTRAINT "PK_order_leader_chat_read_states" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_leader_chat_read_states_order" FOREIGN KEY ("orderId")
          REFERENCES "orders" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_leader_chat_read_states_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_leader_chat_read_states_message" FOREIGN KEY ("lastReadMessageId")
          REFERENCES "order_leader_chats" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_order_leader_chat_read_states_order_user"
      ON "order_leader_chat_read_states" ("orderId", "userId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_order_leader_chat_read_states_order_user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_leader_chat_read_states"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_leader_chats_active_tags"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_leader_chats_active_order_user_time"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_leader_chats_active_order_time_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_leader_chats"`);
  }
}
