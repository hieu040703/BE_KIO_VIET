import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUniqueMarginIdOnTimeKeepings1777000000000 implements MigrationInterface {
  name = "DropUniqueMarginIdOnTimeKeepings1777000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "time_keepings"
      DROP CONSTRAINT IF EXISTS "REL_eb84524b31fd62e6180d5e31c0"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "time_keepings"
      ADD CONSTRAINT "REL_eb84524b31fd62e6180d5e31c0" UNIQUE ("marginId")
    `);
  }
}
