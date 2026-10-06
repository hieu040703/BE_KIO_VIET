import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCallHistories1776600000000 implements MigrationInterface {
  name = "CreateCallHistories1776600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_histories_calltype_enum') THEN
          CREATE TYPE "call_histories_calltype_enum" AS ENUM ('OUTGOING', 'INCOMING');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "call_histories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "startTime" timestamp with time zone NOT NULL,
        "endTime" timestamp with time zone DEFAULT NULL,
        "duration" int DEFAULT NULL,
        "answerDuration" int DEFAULT NULL,
        "endCallCause" varchar DEFAULT NULL,
        "endedBy" varchar DEFAULT NULL,
        "callType" "call_histories_calltype_enum" NOT NULL DEFAULT 'OUTGOING',
        "callerPhoneNumber" varchar DEFAULT NULL,
        "receiverPhoneNumber" varchar DEFAULT NULL,
        "callerId" uuid NOT NULL,
        "receiverId" uuid NOT NULL,
        "callId" varchar NOT NULL,
        "recordingUrl" varchar DEFAULT NULL,
        CONSTRAINT "PK_call_histories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_call_histories_caller" FOREIGN KEY ("callerId") REFERENCES "users" ("id"),
        CONSTRAINT "FK_call_histories_receiver" FOREIGN KEY ("receiverId") REFERENCES "users" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_call_histories_callId"
      ON "call_histories" ("callId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_call_histories_callerId"
      ON "call_histories" ("callerId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_call_histories_receiverId"
      ON "call_histories" ("receiverId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_call_histories_receiverId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_call_histories_callerId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_call_histories_callId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "call_histories"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "call_histories_calltype_enum"`);
  }
}
