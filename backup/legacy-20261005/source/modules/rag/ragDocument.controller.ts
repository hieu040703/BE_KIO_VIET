import { injectable, inject } from "inversify";
import { NextFunction, Request, Response } from "express";
import { RAG_TYPES } from "./rag.types";
import { RagDocumentService } from "./ragDocument.service";
import { RagDocumentQuerySchema, RagDocumentListSchema } from "./rag.validator";
import logger from "@/shared/utils/logger";

@injectable()
export class RagDocumentController {
  constructor(@inject(RAG_TYPES.RagDocumentService) private readonly documentService: RagDocumentService) {}

  /**
   * POST /v1/rag/documents/upload
   * Upload file & xử lý RAG pipeline (chunk → embed → store).
   * Body (multipart/form-data): files[] + category?
   */
  uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const files = req.files as Express.Multer.File[];
      const category = (req.body?.category as string) || undefined;

      if (!files || files.length === 0) {
        return res.status(400).json({
          statusCode: 400,
          message: "Vui lòng upload ít nhất 1 file",
          data: null,
        });
      }

      const results = [];
      for (const file of files) {
        const result = await this.documentService.uploadAndProcess({
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: file.path,
          fileUrl: (file as any).url || undefined,
          category,
        });
        results.push({
          documentId: result.document.id,
          fileName: result.document.originalName,
          status: result.document.status,
          chunkCount: result.chunkCount,
          totalChars: result.document.totalChars,
        });
      }

      return res.status(201).json({
        statusCode: 201,
        message: `Đã xử lý ${results.length} tài liệu`,
        data: results,
      });
    } catch (error) {
      logger.error("[RAG Doc Controller] Upload failed", error);
      next(error);
      return;
    }
  };

  /**
   * POST /v1/rag/documents/query
   * Tìm kiếm thông tin từ các tài liệu đã upload.
   * Body: { query, k?, documentIds?, category?, provider? }
   */
  queryDocuments = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const dto = RagDocumentQuerySchema.parse(req.body);
      const result = await this.documentService.queryDocuments(dto.query, {
        k: dto.k,
        documentIds: dto.documentIds,
        category: dto.category,
        providerOverride: dto.provider,
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Thành công",
        data: result.data,
        meta: {
          query_hash: result.query_hash,
          cache_hit: result.cache_hit,
          latency_ms: result.latency_ms,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  /**
   * GET /v1/rag/documents
   * Lấy danh sách tài liệu đã upload (phân trang).
   * Query: page?, limit?, status?, category?
   */
  listDocuments = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const dto = RagDocumentListSchema.parse(req.query);
      const result = await this.documentService.listDocuments(dto);

      return res.status(200).json({
        statusCode: 200,
        message: "Thành công",
        data: result.documents,
        meta: {
          page: dto.page,
          limit: dto.limit,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  /**
   * DELETE /v1/rag/documents/:id
   * Xóa tài liệu và tất cả vector chunks liên quan.
   */
  deleteDocument = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      await this.documentService.deleteDocument(id);

      return res.status(200).json({
        statusCode: 200,
        message: "Đã xóa tài liệu và các vector chunks",
        data: null,
      });
    } catch (error) {
      next(error);
      return;
    }
  };
}
