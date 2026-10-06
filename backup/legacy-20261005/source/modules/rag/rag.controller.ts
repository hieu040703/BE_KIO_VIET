import { injectable, inject } from "inversify";
import { NextFunction, Request, Response } from "express";
import { RAG_TYPES } from "./rag.types";
import { RagService } from "./rag.service";
import { RagQuerySchema, RagSyncSchema } from "./rag.validator";

@injectable()
export class RagController {
  constructor(@inject(RAG_TYPES.RagService) private readonly ragService: RagService) {}

  /**
   * POST /v1/rag/query
   * Body: { serviceOrder: ServiceOrderInput, filters?, k?, provider? }
   */
  queryRag = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const dto = RagQuerySchema.parse(req.body);
      const result = await this.ragService.query(dto);

      return res.status(200).json({
        statusCode: 200,
        message: "Thành công",
        data: result.data,
        meta: {
          query_hash: result.query_hash,
          cache_hit: result.cache_hit,
          latency_ms: result.latency_ms,
          derived_query: result.derived_query,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  };

  /**
   * POST /v1/rag/sync
   * Body: { forceResync?, limit? }
   * Admin-only endpoint để trigger sync thủ công
   */
  syncVectors = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const dto = RagSyncSchema.parse(req.body);
      const result = await this.ragService.sync(dto);

      return res.status(200).json({
        statusCode: 200,
        message: `Đồng bộ hoàn tất: ${result.synced} thành công, ${result.failed} thất bại`,
        data: result,
      });
    } catch (error) {
      next(error);
      return;
    }
  };
}
