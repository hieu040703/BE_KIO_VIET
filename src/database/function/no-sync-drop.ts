import { DataSource } from "typeorm";
import { config } from "../../shared/config/env";

async function noSyncDropDatabase() {
  // Create DataSource without synchronize
  const dataSource = new DataSource({
    type: "postgres",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    synchronize: false, // Tắt synchronize để tránh enum conflict
    logging: false,
    entities: [], // Không load entities để tránh schema sync
  });

  try {
    console.log("🔄 Connecting without schema synchronization...");
    await dataSource.initialize();
    console.log("🔗 Database connected (no sync)");

    const queryRunner = dataSource.createQueryRunner();

    try {
      // Terminate all active connections to the database first
      console.log("🔌 Terminating active connections...");
      await queryRunner.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database() AND pid <> pg_backend_pid();
      `);

      // Drop all tables and recreate schema
      console.log("🗑️ Dropping all tables individually...");

      // Get list of all tables in public schema
      const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public';
      `);

      if (tables.length > 0) {
        // Drop all tables with CASCADE
        const tableNames = tables.map((t: any) => `"${t.tablename}"`).join(", ");
        await queryRunner.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE;`);
        console.log(`🗑️ Dropped ${tables.length} tables`);
      }

      // Drop all types/enums
      const types = await queryRunner.query(`
        SELECT typname 
        FROM pg_type 
        WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'e';
      `);

      if (types.length > 0) {
        for (const type of types) {
          await queryRunner.query(`DROP TYPE IF EXISTS "${type.typname}" CASCADE;`);
        }
        console.log(`🗑️ Dropped ${types.length} enum types`);
      }

      // Drop all sequences
      const sequences = await queryRunner.query(`
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public';
      `);

      if (sequences.length > 0) {
        for (const seq of sequences) {
          await queryRunner.query(`DROP SEQUENCE IF EXISTS "${seq.sequencename}" CASCADE;`);
        }
        console.log(`🗑️ Dropped ${sequences.length} sequences`);
      }

      console.log("✅ Database successfully dropped and recreated!");
      console.log("🆕 Fresh schema ready for new migrations");
    } catch (error) {
      console.error("❌ Error during drop operation:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("❌ Error dropping database:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log("🔒 Database connection closed");
  }
}

noSyncDropDatabase();
