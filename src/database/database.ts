import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "../shared/config/env";
import path from "path";

import { entities } from "@/database/models";

const isDevelopment = process.env.NODE_ENV !== "production";
const isProduction = process.env.NODE_ENV === "production";

// Get the correct base path for entities, migrations, and subscribers
const getBasePath = () => {
  if (isProduction) {
    // In production, __dirname will be dist/config
    return path.join(__dirname, "..");
  } else {
    // In development, __dirname will be src/config
    return path.join(__dirname, "..");
  }
};

const basePath = getBasePath();

// Cấu hình logging cho profiling (gated bằng env, mặc định false — không ảnh hưởng prod).
// - DB_LOGGING=true          → log toàn bộ SQL + params ("all").
// - DB_SLOW_QUERY_MS=<ms>     → chỉ cần một logger tồn tại (["error"]) để TypeORM
//                              gọi logQuerySlow cho các query vượt ngưỡng maxQueryExecutionTime.
const dbLoggingOption: DataSourceOptions["logging"] = config.DB_LOGGING
  ? "all"
  : config.DB_SLOW_QUERY_MS > 0
    ? ["error"]
    : false;

// Create the original DataSource instance
const originalDataSource = new DataSource({
  type: "postgres",
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  synchronize: false,
  logging: false,
  maxQueryExecutionTime: config.DB_SLOW_QUERY_MS > 0 ? config.DB_SLOW_QUERY_MS : undefined,
  connectTimeoutMS: config.DB_POOL_CONNECTION_TIMEOUT_MS,
  entities: entities,
  migrations: [
    isProduction
      ? path.join(basePath, "database/migrations/**/*.js")
      : path.join(basePath, "database/migrations/**/*.ts"),
  ],
  subscribers: [
    isProduction
      ? path.join(basePath, "database/subscribers/**/*.js")
      : path.join(basePath, "database/subscribers/**/*.ts"),
  ],
  schema: "public",
  extra: {
    application_name: config.DB_APPLICATION_NAME,
    max: config.DB_POOL_MAX,
    min: config.DB_POOL_MIN,
    idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: config.DB_POOL_CONNECTION_TIMEOUT_MS,
  },
});

// Create a wrapper to protect against multiple destroy calls
function createDatabaseWrapper(dataSource: DataSource): DataSource {
  let isDestroying = false;
  let isDestroyed = false;

  return new Proxy(dataSource, {
    get(target, prop) {
      if (prop === "destroy") {
        return async () => {
          // Prevent multiple destroy attempts
          if (isDestroying || isDestroyed) {
            console.log("Database connection already closed or closing");
            return;
          }

          isDestroying = true;
          try {
            await target.destroy();
            isDestroyed = true;
            console.log("Database connection successfully closed");
          } catch (error: any) {
            console.warn("Error closing database connection:", error.message);
            // Mark as destroyed anyway to prevent future attempts
            isDestroyed = true;
          } finally {
            isDestroying = false;
          }
        };
      }

      // For all other properties, just return the original
      const value = (target as any)[prop];
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

const DatabaseConfig = createDatabaseWrapper(originalDataSource);

export default DatabaseConfig;
