import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployeeTicketParticipants1779800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "employee_ticket_participants" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "employeeTicketId" UUID NOT NULL,
        "userId" UUID NOT NULL,
        "addedByUserId" UUID NOT NULL,
        "removedByUserId" UUID,
        "tempId" UUID,
        "note" TEXT,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "createdBy" INTEGER,
        "updatedBy" INTEGER,
        "deletedAt" TIMESTAMP,
        CONSTRAINT "FK_employee_ticket_participants_ticket"
          FOREIGN KEY ("employeeTicketId") REFERENCES "employee_tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_employee_ticket_participants_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_employee_ticket_participants_added_by_user"
          FOREIGN KEY ("addedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_employee_ticket_participants_removed_by_user"
          FOREIGN KEY ("removedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_employee_ticket_participants_active"
      ON "employee_ticket_participants" ("employeeTicketId", "userId")
      WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employee_ticket_participants_userId_active"
      ON "employee_ticket_participants" ("userId")
      WHERE "deletedAt" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_employee_ticket_participants_ticketId_active"
      ON "employee_ticket_participants" ("employeeTicketId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_ticket_participants_ticketId_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_ticket_participants_userId_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employee_ticket_participants_active"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_ticket_participants"`);
  }
}
