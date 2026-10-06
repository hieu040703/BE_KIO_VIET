import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Đổi cột embedding từ vector(1536) → vector(2000) để dùng OpenAI text-embedding-3-large với MRL.
 * pgvector HNSW index giới hạn tối đa 2000 dimensions.
 * OpenAI text-embedding-3-large hỗ trợ giảm dims qua MRL, dùng 2000 vẫn tốt hơn 3-small ở 1536.
 * Tất cả vector cũ bị truncated/invalid → phải resync toàn bộ sau migration này.
 */
export class AlterVectorDimension30721775200100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop HNSW index (phụ thuộc vào dimension)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_service_order_vectors_embedding_hnsw";
    `);

    // 2. Xóa toàn bộ row cũ (vector cũ không tương thích với dimension mới)
    await queryRunner.query(`TRUNCATE TABLE "service_order_vectors";`);

    // 3. Đổi kiểu cột lên 2000 dims (max cho HNSW index trong pgvector)
    await queryRunner.query(`
      ALTER TABLE "service_order_vectors"
        ALTER COLUMN "embedding" TYPE vector(2000)
        USING NULL::vector(2000);
    `);

    // 4. Reset flag syncedToVector để trigger resync
    await queryRunner.query(`
      UPDATE "service_orders" SET "syncedToVector" = false;
    `);

    // 5. Tạo lại HNSW index với dimension mới
    await queryRunner.query(`
      CREATE INDEX "IDX_service_order_vectors_embedding_hnsw"
        ON "service_order_vectors"
        USING hnsw ("embedding" vector_cosine_ops)
        WITH (ef_construction = 64, m = 16);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_service_order_vectors_embedding_hnsw";`);
    await queryRunner.query(`TRUNCATE TABLE "service_order_vectors";`);
    await queryRunner.query(`
      ALTER TABLE "service_order_vectors"
        ALTER COLUMN "embedding" TYPE vector(1536)
        USING NULL::vector(1536);
    `);
    await queryRunner.query(`UPDATE "service_orders" SET "syncedToVector" = false;`);
    await queryRunner.query(`
      CREATE INDEX "IDX_service_order_vectors_embedding_hnsw"
        ON "service_order_vectors"
        USING hnsw ("embedding" vector_cosine_ops)
        WITH (ef_construction = 64, m = 16);
    `);
  }
}
