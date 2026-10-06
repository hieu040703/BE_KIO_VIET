import DatabaseConfig from "@/database/database";

async function syncSchema() {
  try {
    console.log("🔄 Synchronizing database schema without data loss...");

    await DatabaseConfig.initialize();

    // Đồng bộ schema mà không xóa dữ liệu
    // synchronize(false) sẽ:
    // - Tạo bảng mới nếu chưa có
    // - Thêm cột mới nếu thiếu
    // - Cập nhật index, constraint
    // - KHÔNG xóa bảng hoặc dữ liệu hiện có
    await DatabaseConfig.synchronize(false);
    console.log("✅ Database schema synchronized (data preserved)");

    await DatabaseConfig.destroy();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Schema synchronization error:", error);
    process.exit(1);
  }
}

syncSchema();
