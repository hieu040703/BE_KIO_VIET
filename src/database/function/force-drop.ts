import DatabaseConfig from "@/database/database";

async function forceDropDatabase() {
  try {
    console.log("🔄 Force dropping database...");

    await DatabaseConfig.initialize();
    console.log("🔗 Database connected");

    const queryRunner = DatabaseConfig.createQueryRunner();

    try {
      // Terminate all active connections to the database first
      console.log("🔌 Terminating active connections...");
      await queryRunner.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database() AND pid <> pg_backend_pid();
      `);

      // Drop all tables with CASCADE to handle dependencies
      console.log("🗑️ Dropping all tables...");
      await queryRunner.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO public;
        GRANT ALL ON SCHEMA public TO ${(DatabaseConfig.options as any).username};
      `);

      console.log("✅ Database force dropped successfully");
    } catch (error) {
      console.error("❌ Error during force drop:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    await DatabaseConfig.destroy();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Error force dropping database:", error);
    process.exit(1);
  }
}

forceDropDatabase();
