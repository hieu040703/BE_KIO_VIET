import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateServicePrices1776000000000 implements MigrationInterface {
  name = "CreateServicePrices1776000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_prices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "serviceId" uuid NOT NULL,
        "category" varchar NOT NULL,
        "price" numeric(15,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_service_prices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_service_prices_service" FOREIGN KEY ("serviceId")
          REFERENCES "services"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_prices_serviceId"
      ON "service_prices" ("serviceId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_prices_serviceId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_prices"`);
  }
}
