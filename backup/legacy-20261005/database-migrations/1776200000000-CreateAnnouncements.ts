import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnnouncements1776200000000 implements MigrationInterface {
  name = "CreateAnnouncements1776200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcements_status_enum') THEN
          CREATE TYPE "announcements_status_enum" AS ENUM ('DRAFT', 'SENT');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "title" character varying(500) NOT NULL,
        "content" text NOT NULL,
        "sentAt" TIMESTAMP,
        "sentBy" uuid,
        "status" "announcements_status_enum" NOT NULL DEFAULT 'DRAFT',
        CONSTRAINT "PK_announcements" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_announcements_sentBy'
        ) THEN
          ALTER TABLE "announcements"
            ADD CONSTRAINT "FK_announcements_sentBy"
            FOREIGN KEY ("sentBy") REFERENCES "users"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT IF EXISTS "FK_announcements_sentBy"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "announcements"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "announcements_status_enum"`);
  }
}
