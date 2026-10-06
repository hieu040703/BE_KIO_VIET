import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployeeTickets1778700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_tickets_type_enum') THEN
          CREATE TYPE employee_tickets_type_enum AS ENUM (
            'PAYROLL_BENEFITS',
            'ATTENDANCE_LEAVE',
            'CONTRACT_PROFILE',
            'WORK_ASSIGNMENT',
            'EQUIPMENT_IT',
            'OPERATION_INCIDENT',
            'FEEDBACK_REQUEST',
            'OTHER'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_tickets_status_enum') THEN
          CREATE TYPE employee_tickets_status_enum AS ENUM (
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
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_ticket_replies_type_enum') THEN
          CREATE TYPE employee_ticket_replies_type_enum AS ENUM (
            'ADMIN',
            'AUTHORIZED_USER',
            'EMPLOYEE',
            'SYSTEM'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employee_tickets" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "employeeId" UUID NOT NULL,
        "createdByUserId" UUID NOT NULL,
        "type" employee_tickets_type_enum NOT NULL,
        "priority" INTEGER NOT NULL DEFAULT 3,
        "issue" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "attachments" JSONB,
        "status" employee_tickets_status_enum NOT NULL DEFAULT 'OPEN',
        "tempId" UUID,
        "note" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" INTEGER,
        "updatedBy" INTEGER,
        "deletedAt" TIMESTAMP,
        CONSTRAINT "FK_employee_tickets_employee"
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_employee_tickets_created_by_user"
          FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employee_ticket_replies" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "employeeTicketId" UUID NOT NULL,
        "userId" UUID NOT NULL,
        "content" TEXT NOT NULL,
        "type" employee_ticket_replies_type_enum NOT NULL,
        "attachments" JSONB,
        "tempId" UUID,
        "note" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" INTEGER,
        "updatedBy" INTEGER,
        "deletedAt" TIMESTAMP,
        CONSTRAINT "FK_employee_ticket_replies_ticket"
          FOREIGN KEY ("employeeTicketId") REFERENCES "employee_tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_employee_ticket_replies_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employee_tickets_employeeId"
      ON "employee_tickets" ("employeeId") WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employee_tickets_createdByUserId"
      ON "employee_tickets" ("createdByUserId") WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employee_tickets_status"
      ON "employee_tickets" ("status") WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employee_ticket_replies_ticketId"
      ON "employee_ticket_replies" ("employeeTicketId") WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_ticket_replies_ticketId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_tickets_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_tickets_createdByUserId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_tickets_employeeId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_ticket_replies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_tickets"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_ticket_replies_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_tickets_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_tickets_type_enum"`);
  }
}
