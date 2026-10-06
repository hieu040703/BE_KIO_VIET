import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { User } from "./User";

/**
 * FileUpload Entity
 * Lưu trữ thông tin các file đã upload lên MinIO
 */
@Entity("file_uploads")
export class FileUpload extends BaseEntity {
  @Column({ type: "varchar", length: 500 })
  objectName: string; // Tên object trong MinIO (path đầy đủ)

  @Column({ type: "varchar", length: 255 })
  originalName: string; // Tên file gốc

  @Column({ type: "varchar", length: 100 })
  bucketName: string; // Tên bucket

  @Column({ type: "varchar", length: 50, nullable: true })
  mimeType?: string; // Loại file (image/png, application/pdf, ...)

  @Column({ type: "bigint" })
  size: number; // Kích thước file (bytes)

  @Column({ type: "varchar", length: 255, nullable: true })
  folder?: string; // Thư mục lưu trữ

  @Column({ type: "varchar", length: 100, nullable: true })
  etag?: string; // ETag từ MinIO

  @Column({ type: "varchar", length: 1000, nullable: true })
  downloadUrl?: string; // URL download (có thể là presigned URL)

  @Column({ type: "varchar", length: 500, nullable: true })
  thumbnailObjectName?: string; // Tên object thumbnail trong MinIO

  @Column({ type: "varchar", length: 1000, nullable: true })
  thumbnailUrl?: string; // URL download thumbnail

  @Column({ type: "bigint", nullable: true })
  thumbnailSize?: number; // Kích thước file thumbnail (bytes)

  @Column({ type: "uuid", nullable: true })
  uploadedBy?: string; // User ID người upload

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>; // Metadata bổ sung

  @Column({ type: "boolean", default: true })
  isActive: boolean; // Trạng thái file

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "uploadedBy" })
  uploader?: User;
}
