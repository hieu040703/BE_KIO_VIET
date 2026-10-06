import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerCares1778200000000 implements MigrationInterface {
  name = "CreateCustomerCares1778200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_cares_method_enum') THEN
          CREATE TYPE "customer_cares_method_enum" AS ENUM (
            'CALL', 'EMAIL', 'ZALO', 'SMS', 'IN_PERSON', 'OTHER'
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_cares_status_enum') THEN
          CREATE TYPE "customer_cares_status_enum" AS ENUM (
            'SCHEDULED', 'COMPLETED', 'CANCELED'
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer_cares" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tempId" uuid,
        "note" text,
        "createdAt" TIMESTAMP,
        "updatedAt" TIMESTAMP,
        "createdBy" integer,
        "updatedBy" integer,
        "deletedAt" TIMESTAMP,
        "customerId" uuid NOT NULL,
        "employeeId" uuid NOT NULL,
        "method" "customer_cares_method_enum" NOT NULL,
        "status" "customer_cares_status_enum" NOT NULL DEFAULT 'SCHEDULED',
        "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "nextFollowUpAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_customer_cares" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer_cares_customer"
          FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_customer_cares_employee"
          FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_customer_cares_customer_scheduled"
      ON "customer_cares" ("customerId", "scheduledAt" DESC)
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_customer_cares_customer_scheduled"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_cares"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "customer_cares_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "customer_cares_method_enum"`);
  }
}
