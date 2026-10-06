import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVouchers1776800000000 implements MigrationInterface {
  name = "CreateVouchers1776800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vouchers_templates_status_enum') THEN
          CREATE TYPE "vouchers_templates_status_enum" AS ENUM ('ACTIVE', 'INACTIVE');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vouchers_templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "name" varchar(255) NOT NULL,
        "code" varchar(50) NOT NULL,
        "points" integer NOT NULL,
        "amount" numeric(15,2) DEFAULT NULL,
        "status" "vouchers_templates_status_enum" NOT NULL DEFAULT 'ACTIVE',
        CONSTRAINT "PK_vouchers_templates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_vouchers_templates_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vouchers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "userId" uuid NOT NULL,
        "customerId" uuid NOT NULL,
        "vouchersTemplateId" uuid NOT NULL,
        "code" varchar(80) NOT NULL,
        "redeemedAt" timestamp without time zone NOT NULL,
        "expiredAt" timestamp without time zone NOT NULL,
        "isUsed" boolean NOT NULL DEFAULT false,
        "usedAt" timestamp without time zone DEFAULT NULL,
        CONSTRAINT "PK_vouchers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_vouchers_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "service_orders"
      ADD COLUMN IF NOT EXISTS "vouchersId" uuid DEFAULT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "service_orders"
      ADD COLUMN IF NOT EXISTS "voucherDiscountAmount" numeric(15,2) DEFAULT NULL
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_vouchers_templates_code" ON "vouchers_templates" ("code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_vouchers_code" ON "vouchers" ("code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_vouchers_customer" ON "vouchers" ("customerId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_vouchers_template" ON "vouchers" ("vouchersTemplateId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_service_orders_vouchers" ON "service_orders" ("vouchersId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_orders_vouchers"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vouchers_template"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vouchers_customer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vouchers_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vouchers_templates_code"`);
    await queryRunner.query(`ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "voucherDiscountAmount"`);
    await queryRunner.query(`ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "vouchersId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vouchers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vouchers_templates"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vouchers_templates_status_enum"`);
  }
}
