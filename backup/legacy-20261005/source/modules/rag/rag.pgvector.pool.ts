import { Pool } from "pg";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";

/**
 * Pool riêng dành cho LangChain PGVectorStore.
 * Tách biệt hoàn toàn với TypeORM DataSource (max: 20) để tránh tranh chấp connection.
 * Pool này dùng max: 10 connections, chỉ thao tác bảng service_order_vectors.
 */
let pgVectorPool: Pool | null = null;

export function getPgVectorPool(): Pool {
  if (!pgVectorPool) {
    pgVectorPool = new Pool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      max: config.RAG_PG_POOL_MAX,
      idleTimeoutMillis: config.RAG_PG_IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: config.RAG_PG_CONNECTION_TIMEOUT_MS,
      application_name: `${config.DB_APPLICATION_NAME}:rag`,
    });

    pgVectorPool.on("connect", () => {
      logger.info("[RAG] pgvector pool: new connection established");
    });

    pgVectorPool.on("error", (err: Error) => {
      logger.error("[RAG] pgvector pool error:", err);
    });
  }

  return pgVectorPool;
}

export async function closePgVectorPool(): Promise<void> {
  if (pgVectorPool) {
    await pgVectorPool.end();
    pgVectorPool = null;
    logger.info("[RAG] pgvector pool closed");
  }
}
