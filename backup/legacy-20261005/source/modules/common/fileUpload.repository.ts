import { Repository } from "typeorm";
import { injectable } from "inversify";
import DatabaseConfig from "@/database/database";
import { FileUpload } from "@/database/models/FileUpload";

@injectable()
export class FileUploadRepository extends Repository<FileUpload> {
  constructor() {
    super(FileUpload, DatabaseConfig.manager);
  }

  /**
   * Tìm file theo objectName
   */
  async findByObjectName(objectName: string): Promise<FileUpload | null> {
    return this.findOne({ where: { objectName } });
  }

  /**
   * Lấy danh sách file theo user
   */
  async findByUser(userId: string, limit: number = 50): Promise<FileUpload[]> {
    return this.find({
      where: { uploadedBy: userId, isActive: true },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Lấy danh sách file theo folder
   */
  async findByFolder(folder: string, limit: number = 50): Promise<FileUpload[]> {
    return this.find({
      where: { folder, isActive: true },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Lấy tất cả file đang active
   */
  async findAllActive(page: number = 1, limit: number = 50): Promise<{ files: FileUpload[]; total: number }> {
    const [files, total] = await this.findAndCount({
      where: { isActive: true },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
      relations: ["uploader"],
    });

    return { files, total };
  }

  /**
   * Soft delete file
   */
  async softDeleteFile(id: string): Promise<boolean> {
    const result = await this.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }
}
