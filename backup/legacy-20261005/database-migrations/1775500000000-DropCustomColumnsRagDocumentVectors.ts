import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Xóa cột document_id & chunk_index khỏi rag_document_vectors.
 * LangChain PGVectorStore chỉ ghi content, embedding, metadata — không tự động
 * populate các cột custom. Dữ liệu documentId & chunkIndex đã có trong metadata JSONB.
 */
export class DropCustomColumnsRagDocumentVectors1775500000000 implements MigrationInterface {
  name = "DropCustomColumnsRagDocumentVectors1775500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop index trước khi drop column
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rag_document_vectors_chunk_index"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rag_document_vectors_document_id"`);

    // Drop các cột custom không được LangChain populate
    await queryRunner.query(`ALTER TABLE "rag_document_vectors" DROP COLUMN IF EXISTS "chunk_index"`);
    await queryRunner.query(`ALTER TABLE "rag_document_vectors" DROP COLUMN IF EXISTS "document_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rag_document_vectors" ADD COLUMN IF NOT EXISTS "document_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "rag_document_vectors" ADD COLUMN IF NOT EXISTS "chunk_index" int NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_rag_document_vectors_document_id" ON "rag_document_vectors" ("document_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_rag_document_vectors_chunk_index" ON "rag_document_vectors" ("document_id", "chunk_index")`,
    );
  }
}
