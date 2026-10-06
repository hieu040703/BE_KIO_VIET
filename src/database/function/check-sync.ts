import DatabaseConfig from "@/database/database";

type TableRow = { table_name: string };
type ColumnRow = { column_name: string };

async function checkSyncStatus(): Promise<void> {
  try {
    await DatabaseConfig.initialize();

    const hasPendingMigrations = await DatabaseConfig.showMigrations();
    if (hasPendingMigrations) {
      throw new Error("Pending migrations found");
    }

    const databaseTables = await DatabaseConfig.query<TableRow[]>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('migrations', 'typeorm_metadata')
      ORDER BY table_name
    `);
    const metadataTables = DatabaseConfig.entityMetadatas.map((metadata) => metadata.tableName).sort();
    const actualTables = databaseTables.map((row) => row.table_name).sort();

    if (JSON.stringify(actualTables) !== JSON.stringify(metadataTables)) {
      throw new Error(
        `Table mismatch. Database-only: ${actualTables.filter((table) => !metadataTables.includes(table)).join(", ")}; ` +
          `model-only: ${metadataTables.filter((table) => !actualTables.includes(table)).join(", ")}`,
      );
    }

    for (const metadata of DatabaseConfig.entityMetadatas) {
      const databaseColumns = await DatabaseConfig.query<ColumnRow[]>(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [metadata.tableName]);
      const expectedColumns = metadata.columns.map((column) => column.databaseName).sort();
      const actualColumns = databaseColumns.map((column) => column.column_name).sort();
      if (JSON.stringify(actualColumns) !== JSON.stringify(expectedColumns)) {
        throw new Error(`Column mismatch in ${metadata.tableName}`);
      }
    }

    console.log(`Database is migrated and matches ${metadataTables.length} registered Kiot entities.`);
    await DatabaseConfig.destroy();
  } catch (error) {
    console.error("Database check failed:", error);
    if (DatabaseConfig.isInitialized) await DatabaseConfig.destroy();
    process.exitCode = 1;
  }
}

void checkSyncStatus();
