import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServiceOrderChatMessages1775700000000 implements MigrationInterface {
  name = "CreateServiceOrderChatMessages1775700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'service_order_chat_messages_messagetype_enum'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."service_order_chat_messages_messagetype_enum" AS ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_order_chat_messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "serviceOrderId" uuid NOT NULL,
        "senderUserId" uuid DEFAULT NULL,
        "messageType" "public"."service_order_chat_messages_messagetype_enum" NOT NULL,
        "content" text DEFAULT NULL,
        "attachments" jsonb DEFAULT NULL,
        "timeAt" timestamptz NOT NULL DEFAULT now(),
        "metadata" jsonb DEFAULT NULL,
        CONSTRAINT "PK_service_order_chat_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_chat_messages_active_serviceOrder_timeAt"
      ON "service_order_chat_messages" ("serviceOrderId", "timeAt")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_chat_messages_active_serviceOrder_timeAt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_order_chat_messages"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."service_order_chat_messages_messagetype_enum"`);
  }
}
