import DatabaseConfig from "@/database/database";

async function dropSchema() {
  try {
    console.log("🔄 Dropping database schema...");

    await DatabaseConfig.initialize();
    console.log("🔗 Database connected");

    const queryRunner = DatabaseConfig.createQueryRunner();
    try {
      // First, try to handle enum conflicts by updating existing data
      console.log("🔧 Handling enum conflicts...");

      // Check if finance_log table exists and has data with INCOME type
      const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'finance_log'
        );
      `);

      if (tableExists[0].exists) {
        // Update INCOME to IN and EXPENSE to OUT if they exist
        await queryRunner.query(`
          UPDATE finance_log 
          SET type = CASE 
            WHEN type = 'INCOME' THEN 'IN'
            WHEN type = 'EXPENSE' THEN 'OUT'
            ELSE type
          END
          WHERE type IN ('INCOME', 'EXPENSE');
        `);
        console.log("📝 Updated existing enum values");
      }

      // Drop custom enum types first (PostgreSQL specific)
      await queryRunner.query(`DROP TYPE IF EXISTS "public"."attributes_type_enum" CASCADE;`);
      await queryRunner.query(`DROP TYPE IF EXISTS "public"."finance_log_type_enum" CASCADE;`);
      await queryRunner.query(`DROP TYPE IF EXISTS "public"."transaction_type_enum" CASCADE;`);
      console.log("🗑️ Dropped existing enum types");
    } catch (error) {
      console.log("ℹ️  Error handling enums (may not exist):", (error as Error).message);
    } finally {
      await queryRunner.release();
    }

    // Drop tất cả tables
    await DatabaseConfig.dropDatabase();
    console.log("🗑️ Database schema dropped successfully");

    await DatabaseConfig.destroy();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Error dropping schema:", error);
    process.exit(1);
  }
}

dropSchema();
