import dotenv from "dotenv";
import path from "node:path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),
  PROJECT_NAME: process.env.PROJECT_NAME || "kiot-retail-api",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_DATABASE: process.env.DB_DATABASE || "postgres",
  DB_POOL_MAX: Number(process.env.DB_POOL_MAX || 10),
  DB_POOL_MIN: Number(process.env.DB_POOL_MIN || 0),
  DB_POOL_IDLE_TIMEOUT_MS: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS || 30000),
  DB_POOL_CONNECTION_TIMEOUT_MS: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS || 10000),
  DB_APPLICATION_NAME: process.env.DB_APPLICATION_NAME || "kiot-retail-api",
  DB_LOGGING: process.env.DB_LOGGING === "true",
  DB_SLOW_QUERY_MS: Number(process.env.DB_SLOW_QUERY_MS || 0),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "kiot-retail-development-secret-change-me",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
};
