import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Tạo bảng service_order_vectors cho RAG pipeline
 * - Managed bởi LangChain PGVectorStore qua pg.Pool riêng (KHÔNG TypeORM entity)
 * - Thêm cột syncedToVector vào service_orders
 * - Index HNSW cho tìm kiếm vector cosine similarity
 */
export class CreateServiceOrderVectors1775200000000 implements MigrationInterface {
  name = "CreateServiceOrderVectors1775200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Bật extension pgvector (idempotent)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // 2. Thêm cột syncedToVector vào service_orders nếu chưa có
    await queryRunner.query(`
      ALTER TABLE "service_orders"
      ADD COLUMN IF NOT EXISTS "syncedToVector" boolean NOT NULL DEFAULT false
    `);

    // 3. Tạo bảng service_order_vectors (schema LangChain PGVectorStore)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_order_vectors" (
        "id"              uuid          NOT NULL DEFAULT gen_random_uuid(),
        "content"         text          NOT NULL,
        "embedding"       vector(768),
        "metadata"        jsonb         NOT NULL DEFAULT '{}',
        "service_order_id" uuid         UNIQUE,
        "created_at"      timestamptz   NOT NULL DEFAULT now(),
        "updated_at"      timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_order_vectors" PRIMARY KEY ("id")
      )
    `);

    // 4. Index HNSW cho cosine similarity (phù hợp với Gemini text-embedding-004)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_vectors_embedding_hnsw"
      ON "service_order_vectors"
      USING hnsw ("embedding" vector_cosine_ops)
      WITH (m = 16, ef_construction = 64)
    `);

    // 5. Index trên metadata JSONB để filter nhanh theo type/status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_vectors_metadata"
      ON "service_order_vectors"
      USING gin ("metadata" jsonb_path_ops)
    `);

    // 6. Index trên service_order_id để upsert nhanh
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_service_order_vectors_service_order_id"
      ON "service_order_vectors" ("service_order_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_vectors_service_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_vectors_metadata"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_vectors_embedding_hnsw"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_order_vectors"`);
    await queryRunner.query(`
      ALTER TABLE "service_orders" DROP COLUMN IF EXISTS "syncedToVector"
    `);
  }
}
