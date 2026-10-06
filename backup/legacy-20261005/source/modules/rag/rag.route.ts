import { Router } from "express";
import { injectable, inject } from "inversify";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { RagController } from "./rag.controller";
import { RagDocumentController } from "./ragDocument.controller";
import { RAG_TYPES } from "./rag.types";
import { config } from "@/shared/config/env";

// Rate limiter riêng cho RAG (LLM queries tốn tài nguyên)
const ragQueryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20, // 20 requests/phút/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Quá nhiều yêu cầu RAG, vui lòng thử lại sau 1 phút",
  },
});

const ragSyncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // sync là heavy operation
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Sync đang xử lý, vui lòng thử lại sau",
  },
});

// Multer config cho upload tài liệu RAG
const documentUpload = multer({
  dest: `${config.UPLOAD_DIR}/rag-documents/`,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 10, // tối đa 10 files/lần upload
  },
});

@injectable()
export class RagRouter {
  private router: Router;

  constructor(
    @inject(RAG_TYPES.RagController) private readonly ragController: RagController,
    @inject(RAG_TYPES.RagDocumentController) private readonly documentController: RagDocumentController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /rag/query – truy vấn RAG (ServiceOrder)
    this.router.post("/query", ragQueryLimiter, this.ragController.queryRag);

    // POST /rag/sync – trigger đồng bộ vector (admin only, đã auth ở router cấp trên)
    this.router.post("/sync", ragSyncLimiter, this.ragController.syncVectors);

    // ─── Document RAG Routes ───────────────────────────────────────────────

    // POST /rag/documents/upload – upload & xử lý tài liệu
    this.router.post("/documents/upload", documentUpload.array("files", 10), this.documentController.uploadDocument);

    // POST /rag/documents/query – tìm kiếm từ tài liệu
    this.router.post("/documents/query", ragQueryLimiter, this.documentController.queryDocuments);

    // GET /rag/documents – danh sách tài liệu
    this.router.get("/documents", this.documentController.listDocuments);

    // DELETE /rag/documents/:id – xóa tài liệu
    this.router.delete("/documents/:id", this.documentController.deleteDocument);
  }

  public getRouter(): Router {
    return this.router;
  }
}
