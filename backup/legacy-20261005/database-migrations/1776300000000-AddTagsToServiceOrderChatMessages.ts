import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsToServiceOrderChatMessages1776300000000 implements MigrationInterface {
  name = "AddTagsToServiceOrderChatMessages1776300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_order_chat_messages"
        ADD COLUMN IF NOT EXISTS "tags" uuid[] DEFAULT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_chat_messages_tags"
      ON "service_order_chat_messages" USING GIN ("tags")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_chat_messages_tags"`);
    await queryRunner.query(`ALTER TABLE "service_order_chat_messages" DROP COLUMN IF EXISTS "tags"`);
  }
}
