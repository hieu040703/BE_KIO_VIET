import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTickets1775900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_type_enum') THEN
          CREATE TYPE ticket_type_enum AS ENUM (
            'LATE_ARRIVAL',
            'STAFF_SHORTAGE',
            'ASSET_DAMAGE',
            'SERVICE_ATTITUDE',
            'OTHER'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status_enum') THEN
          CREATE TYPE ticket_status_enum AS ENUM (
            'OPEN',
            'IN_PROGRESS',
            'RESOLVED',
            'CLOSED'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_reply_type_enum') THEN
          CREATE TYPE ticket_reply_type_enum AS ENUM (
            'ADMIN',
            'SUPPORT',
            'CUSTOMER',
            'SYSTEM'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tickets" (
        "id"            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "customerId"    UUID NOT NULL,
        "serviceOrderId" UUID,
        "type"          ticket_type_enum NOT NULL,
        "priority"      INTEGER NOT NULL DEFAULT 0,
        "issue"         VARCHAR(255) NOT NULL,
        "description"   TEXT NOT NULL,
        "contactPhone"  VARCHAR(20) NOT NULL,
        "preferredTime" VARCHAR(255),
        "status"        ticket_status_enum NOT NULL DEFAULT 'OPEN',
        "note"          TEXT,
        "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"     TIMESTAMP,
        CONSTRAINT "FK_tickets_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_service_order" FOREIGN KEY ("serviceOrderId") REFERENCES "service_orders"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ticket_replies" (
        "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "ticketId"    UUID NOT NULL,
        "userId"      UUID NOT NULL,
        "content"     TEXT NOT NULL,
        "type"        ticket_reply_type_enum NOT NULL,
        "attachments" JSONB,
        "isInternal"  BOOLEAN NOT NULL DEFAULT false,
        "note"        TEXT,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"   TIMESTAMP,
        CONSTRAINT "FK_ticket_replies_ticket" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_replies_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tickets_customerId"
      ON "tickets" ("customerId") WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tickets_status"
      ON "tickets" ("status") WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tickets_serviceOrderId"
      ON "tickets" ("serviceOrderId") WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ticket_replies_ticketId"
      ON "ticket_replies" ("ticketId") WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_replies_ticketId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tickets_serviceOrderId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tickets_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tickets_customerId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_replies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tickets"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_reply_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ticket_type_enum"`);
  }
}
