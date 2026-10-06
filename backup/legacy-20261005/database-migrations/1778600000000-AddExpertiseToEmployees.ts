import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpertiseToEmployees1778600000000 implements MigrationInterface {
  name = "AddExpertiseToEmployees1778600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "expertise" text[] NOT NULL DEFAULT ARRAY[]::text[]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "expertise"`);
  }
}
