import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckInFieldsToOrderEmployees1779300000000 implements MigrationInterface {
  name = "AddCheckInFieldsToOrderEmployees1779300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      ADD COLUMN IF NOT EXISTS "checkInAt" timestamp with time zone DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "checkInLatitude" double precision DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS "checkInLongitude" double precision DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_employees"
      DROP COLUMN IF EXISTS "checkInLongitude",
      DROP COLUMN IF EXISTS "checkInLatitude",
      DROP COLUMN IF EXISTS "checkInAt"
    `);
  }
}
