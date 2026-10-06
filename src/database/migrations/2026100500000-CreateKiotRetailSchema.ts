import fs from "node:fs";
import path from "node:path";
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Applies the checked-in Kiot retail database definition as the first schema
 * migration. The SQL file remains the database source of truth so the
 * migration and the entity metadata can be reviewed side by side.
 */
export class CreateKiotRetailSchema2026100500000 implements MigrationInterface {
  name = "CreateKiotRetailSchema2026100500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schemaPath = path.resolve(process.cwd(), "database/kiot_retail_full_postgresql.sql");
    const schemaSql = fs
      .readFileSync(schemaPath, "utf8")
      .replace(/\bBEGIN;\s*/i, "")
      .replace(/\s*COMMIT;\s*$/i, "");

    await queryRunner.query(schemaSql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = (await queryRunner.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('migrations', 'typeorm_metadata')
    `)) as Array<{ table_name: string }>;

    for (const { table_name: tableName } of tables) {
      const safeTableName = tableName.replace(/"/g, '""');
      await queryRunner.query(`DROP TABLE IF EXISTS "${safeTableName}" CASCADE`);
    }

    await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at()`);
  }
}
