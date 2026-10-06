import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToOrderEmployees1780200000000 implements MigrationInterface {
  name = "AddStatusToOrderEmployees1780200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'order_employees_status_enum'
        ) THEN
          CREATE TYPE "order_employees_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      ADD COLUMN IF NOT EXISTS "status" "order_employees_status_enum" NOT NULL DEFAULT 'PENDING'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_employees" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "order_employees_status_enum"`,
    );
  }
}
