import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderManagerLocations1775600000000 implements MigrationInterface {
  name = "CreateOrderManagerLocations1775600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_manager_locations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "orderId" uuid NOT NULL,
        "employeeId" uuid NOT NULL,
        "latitude" double precision NOT NULL,
        "longitude" double precision NOT NULL,
        "accuracy" double precision DEFAULT NULL,
        "speedMetersPerSecond" double precision DEFAULT NULL,
        "heading" double precision DEFAULT NULL,
        "distanceFromPreviousMeters" double precision DEFAULT NULL,
        "capturedAt" timestamptz NOT NULL DEFAULT now(),
        "source" varchar(50) NOT NULL DEFAULT 'manager-mobile',
        CONSTRAINT "PK_order_manager_locations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_manager_locations_active_order_capturedAt"
      ON "order_manager_locations" ("orderId", "capturedAt")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_manager_locations_active_employee_capturedAt"
      ON "order_manager_locations" ("employeeId", "capturedAt")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_manager_locations_active_order_employee"
      ON "order_manager_locations" ("orderId", "employeeId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_manager_locations_active_order_employee"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_manager_locations_active_employee_capturedAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_manager_locations_active_order_capturedAt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_manager_locations"`);
  }
}
