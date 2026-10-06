import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchManagerConfirmationToOrders1780400000000 implements MigrationInterface {
  name = "AddBranchManagerConfirmationToOrders1780400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'orders_branchmanagerconfirmedstatus_enum'
        ) THEN
          CREATE TYPE "orders_branchmanagerconfirmedstatus_enum" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "branchManagerConfirmedStatus"
        "orders_branchmanagerconfirmedstatus_enum" NOT NULL DEFAULT 'PENDING'
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "branchManagerConfirmedAt" timestamptz NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "branchManagerConfirmedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "branchManagerConfirmedStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "orders_branchmanagerconfirmedstatus_enum"`,
    );
  }
}
