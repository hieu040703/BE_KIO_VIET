import { MigrationInterface, QueryRunner } from "typeorm";

export class DropServicePrice1776100000000 implements MigrationInterface {
  name = "DropServicePrice1776100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "price"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "price" numeric(15,2) DEFAULT NULL`);
  }
}
