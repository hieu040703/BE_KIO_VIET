// Bảng rag_document_vectors được quản lý bởi LangChain PGVectorStore (raw pg.Pool),
// KHÔNG đăng ký vào TypeORM DataSource để tránh xung đột schema.
// Migration: 1775300000000-CreateRagDocumentVectors.ts

export interface IRagDocumentVectorMetadata {
  documentId: string;
  chunkIndex: number;
  fileName: string;
  mimeType: string;
  category?: string | null;
  [key: string]: any;
}
