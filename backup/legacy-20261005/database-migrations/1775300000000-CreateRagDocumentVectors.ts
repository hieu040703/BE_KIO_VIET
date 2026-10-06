import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Tạo bảng rag_document_vectors cho RAG document pipeline
 * - Managed bởi LangChain PGVectorStore qua pg.Pool riêng (KHÔNG TypeORM entity)
 * - Tạo bảng rag_documents cho metadata tài liệu
 * - Index HNSW cho tìm kiếm vector cosine similarity
 */
export class CreateRagDocumentVectors1775300000000 implements MigrationInterface {
  name = "CreateRagDocumentVectors1775300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Bật extension pgvector (idempotent)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // 2. Tạo bảng rag_documents (TypeORM entity)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rag_documents" (
        "id"              uuid          NOT NULL DEFAULT gen_random_uuid(),
        "tempId"          uuid          DEFAULT NULL,
        "note"            text          DEFAULT NULL,
        "createdAt"       timestamp without time zone DEFAULT now(),
        "updatedAt"       timestamp without time zone DEFAULT now(),
        "createdBy"       int           DEFAULT NULL,
        "updatedBy"       int           DEFAULT NULL,
        "deletedAt"       timestamp     DEFAULT NULL,

        "fileName"        varchar(500)  NOT NULL,
        "originalName"    varchar(500)  NOT NULL,
        "mimeType"        varchar(100)  NOT NULL,
        "size"            bigint        NOT NULL DEFAULT 0,
        "filePath"        text          NOT NULL,
        "fileUrl"         text          DEFAULT NULL,
        "status"          varchar(50)   NOT NULL DEFAULT 'PENDING',
        "chunkCount"      int           NOT NULL DEFAULT 0,
        "totalChars"      int           NOT NULL DEFAULT 0,
        "provider"        varchar(50)   NOT NULL DEFAULT 'gemini',
        "embeddingModel"  varchar(100)  DEFAULT NULL,
        "category"        varchar(255)  DEFAULT NULL,
        "extraMetadata"   jsonb         DEFAULT NULL,

        CONSTRAINT "PK_rag_documents" PRIMARY KEY ("id")
      )
    `);

    // 3. Tạo bảng rag_document_vectors (schema LangChain PGVectorStore)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rag_document_vectors" (
        "id"              uuid          NOT NULL DEFAULT gen_random_uuid(),
        "content"         text          NOT NULL,
        "embedding"       vector,
        "metadata"        jsonb         NOT NULL DEFAULT '{}',
        CONSTRAINT "PK_rag_document_vectors" PRIMARY KEY ("id")
      )
    `);

    // 3b. Nếu bảng đã tồn tại với vector kích thước cố định → sửa thành vector không giới hạn
    // Phải drop index trước khi ALTER column type
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rag_document_vectors_embedding_hnsw"`);
    await queryRunner.query(`
      ALTER TABLE "rag_document_vectors"
      ALTER COLUMN "embedding" TYPE vector
    `);

    // 4. (Bỏ qua HNSW index vì vector không giới hạn dimension không tương thích với HNSW)

    // 5. Index trên metadata JSONB để filter nhanh theo documentId/category
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rag_document_vectors_metadata"
      ON "rag_document_vectors"
      USING gin ("metadata" jsonb_path_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rag_document_vectors_metadata"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rag_document_vectors_embedding_hnsw"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rag_document_vectors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rag_documents"`);
  }
}
