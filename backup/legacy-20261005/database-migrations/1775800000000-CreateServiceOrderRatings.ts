import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServiceOrderRatings1775800000000 implements MigrationInterface {
  name = "CreateServiceOrderRatings1775800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_order_ratings" (
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
        "rating" integer NOT NULL,
        "review" text DEFAULT NULL,
        CONSTRAINT "PK_service_order_ratings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "service_order_ratings"
      ADD COLUMN IF NOT EXISTS "review" text DEFAULT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "service_order_ratings"
      ADD COLUMN IF NOT EXISTS "note" text DEFAULT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_ratings_active_order"
      ON "service_order_ratings" ("orderId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_ratings_active_employee"
      ON "service_order_ratings" ("employeeId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_ratings_active_employee"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_ratings_active_order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_order_ratings"`);
  }
}
