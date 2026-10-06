import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Sửa cột embedding trong rag_document_vectors thành vector không giới hạn kích thước.
 * Lỗi: bảng được tạo với vector(768) nhưng model embedding trả về số chiều khác.
 */
export class FixRagDocumentVectorDimension1775400000000 implements MigrationInterface {
  name = "FixRagDocumentVectorDimension1775400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop HNSW index trước khi ALTER column type (HNSW yêu cầu vector có dimension cố định)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rag_document_vectors_embedding_hnsw"`);

    // Đổi cột embedding từ vector(N) → vector (không giới hạn)
    // Lưu ý: HNSW index không tương thích với vector không giới hạn dimension.
    // Với dataset nhỏ (< 100k vectors), sequential scan vẫn đủ nhanh.
    await queryRunner.query(`
      ALTER TABLE "rag_document_vectors"
      ALTER COLUMN "embedding" TYPE vector
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "rag_document_vectors"
      ALTER COLUMN "embedding" TYPE vector(768)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rag_document_vectors_embedding_hnsw"
      ON "rag_document_vectors"
      USING hnsw ("embedding" vector_cosine_ops)
      WITH (m = 16, ef_construction = 64)
    `);
  }
}
