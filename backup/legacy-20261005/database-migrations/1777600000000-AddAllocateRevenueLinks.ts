import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllocateRevenueLinks1777600000000 implements MigrationInterface {
  name = "AddAllocateRevenueLinks1777600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'allocate_revenue_type_enum') THEN
          CREATE TYPE "allocate_revenue_type_enum" AS ENUM (
            'Quản lý nhân viên',
            'Kế toán',
            'Sale khảo sát báo giá',
            'Tuyển dụng',
            'Quản lý chi nhánh',
            'Quản lý kho',
            'Tài xế'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "allocate_revenue" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tempId" uuid DEFAULT NULL,
        "note" text DEFAULT NULL,
        "createdAt" timestamp without time zone DEFAULT now(),
        "updatedAt" timestamp without time zone DEFAULT now(),
        "createdBy" int DEFAULT NULL,
        "updatedBy" int DEFAULT NULL,
        "deletedAt" timestamp DEFAULT NULL,
        "timeAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "fromDate" date DEFAULT NULL,
        "toDate" date DEFAULT NULL,
        "type" "allocate_revenue_type_enum" NOT NULL,
        "totalRevenue" numeric(15,2) NOT NULL DEFAULT 0,
        "totalAllocatedRevenue" numeric(15,2) DEFAULT NULL,
        "totalUnallocatedRevenue" numeric(15,2) DEFAULT NULL,
        "totalRevenueToAllocate" numeric(15,2) DEFAULT NULL,
        CONSTRAINT "PK_allocate_revenue" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "time_keepings"
      ADD COLUMN IF NOT EXISTS "allocateRevenueId" uuid DEFAULT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "order_leaders"
      ADD COLUMN IF NOT EXISTS "allocateRevenueId" uuid DEFAULT NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_time_keepings_allocate_revenue'
        ) THEN
          ALTER TABLE "time_keepings"
          ADD CONSTRAINT "FK_time_keepings_allocate_revenue"
          FOREIGN KEY ("allocateRevenueId") REFERENCES "allocate_revenue" ("id") ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_order_leaders_allocate_revenue'
        ) THEN
          ALTER TABLE "order_leaders"
          ADD CONSTRAINT "FK_order_leaders_allocate_revenue"
          FOREIGN KEY ("allocateRevenueId") REFERENCES "allocate_revenue" ("id") ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_timeKeepings_allocateRevenueId"
      ON "time_keepings" ("allocateRevenueId")
      WHERE "deletedAt" IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orderLeaders_allocateRevenueId"
      ON "order_leaders" ("allocateRevenueId")
      WHERE "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orderLeaders_allocateRevenueId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_timeKeepings_allocateRevenueId"`);
    await queryRunner.query(`ALTER TABLE "order_leaders" DROP CONSTRAINT IF EXISTS "FK_order_leaders_allocate_revenue"`);
    await queryRunner.query(`ALTER TABLE "time_keepings" DROP CONSTRAINT IF EXISTS "FK_time_keepings_allocate_revenue"`);
    await queryRunner.query(`ALTER TABLE "order_leaders" DROP COLUMN IF EXISTS "allocateRevenueId"`);
    await queryRunner.query(`ALTER TABLE "time_keepings" DROP COLUMN IF EXISTS "allocateRevenueId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "allocate_revenue"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "allocate_revenue_type_enum"`);
  }
}
