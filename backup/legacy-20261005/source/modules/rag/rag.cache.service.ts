import { injectable } from "inversify";
import { createHash } from "crypto";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import type { RagQueryDto, RagAnswerDto } from "./rag.validator";
import redisHelper from "@/shared/utils/redis.helper";

/**
 * Tạo cache key từ serviceOrder + filters dùng SHA-256.
 * Đảm bảo key ngắn gọn và deterministic.
 */
function buildCacheKey(dto: Pick<RagQueryDto, "serviceOrder" | "filters">): string {
  const payload = JSON.stringify({ serviceOrder: dto.serviceOrder, filters: dto.filters ?? {} });
  const hash = createHash("sha256").update(payload).digest("hex");
  return `rag:query:${hash}`;
}

@injectable()
export class RagCacheService {
  /**
   * Lấy kết quả từ cache. Trả về null nếu cache miss hoặc Redis lỗi.
   */
  async get(
    dto: Pick<RagQueryDto, "serviceOrder" | "filters">,
  ): Promise<{ data: RagAnswerDto; query_hash: string } | null> {
    const key = buildCacheKey(dto);
    try {
      const cached = await redisHelper.get(key);
      if (!cached) return null;
      const data = JSON.parse(cached) as RagAnswerDto;
      logger.info("[RAG Cache] HIT", { query_hash: key });
      return { data, query_hash: key };
    } catch (err) {
      logger.warn("[RAG Cache] GET error", { key, err });
      return null;
    }
  }

  /**
   * Lưu kết quả vào cache với TTL từ config (mặc định 2h).
   */
  async set(dto: Pick<RagQueryDto, "serviceOrder" | "filters">, answer: RagAnswerDto): Promise<string> {
    const key = buildCacheKey(dto);

    try {
      await redisHelper.set(key, JSON.stringify(answer), config.RAG_CACHE_TTL);
      logger.info("[RAG Cache] SET", { query_hash: key, ttl: config.RAG_CACHE_TTL });
    } catch (err) {
      logger.warn("[RAG Cache] SET error", { key, err });
    }

    return key;
  }

  /**
   * Xóa cache theo key hash (dùng khi cần invalidate thủ công).
   */
  async invalidate(queryHash: string): Promise<void> {
    try {
      await redisHelper.del(queryHash);
    } catch (err) {
      logger.warn("[RAG Cache] DEL error", { key: queryHash, err });
    }
  }

  buildKey(dto: Pick<RagQueryDto, "serviceOrder" | "filters">): string {
    return buildCacheKey(dto);
  }
}
