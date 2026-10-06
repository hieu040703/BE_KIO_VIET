import { Entity, Column } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";

export enum RagDocumentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

/**
 * Quản lý tài liệu upload lên hệ thống RAG.
 * Lưu metadata của tài liệu gốc; vector chunks được quản lý riêng
 * bởi LangChain PGVectorStore (bảng rag_document_vectors).
 */
@Entity("rag_documents")
export class RagDocument extends BaseEntity {
  /** Tên file gốc từ client */
  @Column({ type: "varchar", length: 500 })
  fileName!: string;

  /** Tên file đã lưu trên storage */
  @Column({ type: "varchar", length: 500 })
  originalName!: string;

  /** MIME type (text/plain, application/pdf, ...) */
  @Column({ type: "varchar", length: 100 })
  mimeType!: string;

  /** Kích thước file (bytes) */
  @Column({ type: "bigint" })
  size!: number;

  /** Đường dẫn file trên storage */
  @Column({ type: "text" })
  filePath!: string;

  /** URL truy cập file */
  @Column({ type: "text", nullable: true })
  fileUrl!: string | null;

  /** Trạng thái xử lý */
  @Column({ type: "enum", enum: RagDocumentStatus, default: RagDocumentStatus.PENDING })
  status!: RagDocumentStatus;

  /** Số lượng chunk đã tạo */
  @Column({ type: "int", default: 0 })
  chunkCount!: number;

  /** Tổng số ký tự của nội dung trích xuất */
  @Column({ type: "int", default: 0 })
  totalChars!: number;

  /** Provider dùng để embedding */
  @Column({ type: "varchar", length: 50, default: "gemini" })
  provider!: string;

  /** Model embedding đã dùng */
  @Column({ type: "varchar", length: 100, nullable: true })
  embeddingModel!: string | null;

  /** Category / tag phân loại (optional) */
  @Column({ type: "varchar", length: 255, nullable: true })
  category!: string | null;

  /** Metadata mở rộng */
  @Column({ type: "jsonb", nullable: true })
  extraMetadata!: Record<string, any> | null;
}
