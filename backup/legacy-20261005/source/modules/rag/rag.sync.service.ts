import { injectable } from "inversify";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import DatabaseConfig from "@/database/database";
import { ServiceOrder } from "@/database/models/ServiceOrder";
import { OrderStatusEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import { getPgVectorPool } from "./rag.pgvector.pool";
import { createEmbeddings, resolveProvider, validateProvider } from "./rag.providers";
import type { RagProvider } from "./rag.providers";
import type { IServiceOrderVectorMetadata } from "@/database/models/ServiceOrderVector";

const TABLE_NAME = "service_order_vectors";
const CONTENT_COL = "content";
const VECTOR_COL = "embedding";
const METADATA_COL = "metadata";
const ID_COL = "id";

/**
 * Chuyển ServiceOrder thành chuỗi văn bản để embedding.
 * Format rõ ràng giúp LLM hiểu ngữ cảnh định giá.
 */
function formatOrderToText(order: ServiceOrder): string {
  const addr = order.address
    ? `${order.address.detail ?? ""}, ${order.address.ward ?? ""}, ${order.address.state ?? ""}, ${order.address.country ?? ""}`.trim()
    : "N/A";

  const lines: string[] = [
    `Loại dịch vụ: ${order.type}`,
    `Trạng thái: ${order.status}`,
    `Thời gian: ${order.timeAt ? new Date(order.timeAt).toLocaleDateString("vi-VN") : "N/A"}`,
    `Địa chỉ: ${addr}`,
    `Giá cơ bản: ${order.basePrice ?? "N/A"} VNĐ`,
    `Giá trước VAT: ${order.preVatAmount ?? order.basePrice ?? "N/A"} VNĐ`,
    `Thành tiền: ${order.amount ?? "N/A"} VNĐ`,
    `Gấp: ${order.isUrgent ? "Có" : "Không"}`,
    `Hàng dễ vỡ: ${order.hasFragileItems ? "Có" : "Không"}`,
  ];

  if (order.description) lines.push(`Mô tả: ${order.description}`);
  if (order.specialRequirements) lines.push(`Yêu cầu đặc biệt: ${order.specialRequirements}`);
  if (order.employeeCount) lines.push(`Số nhân viên: ${order.employeeCount}`);

  // Chuyển nhà
  if (order.floorLocationPickup) lines.push(`Tầng lấy hàng: ${order.floorLocationPickup}`);
  if (order.floorLocationDelivery) lines.push(`Tầng giao hàng: ${order.floorLocationDelivery}`);
  if (order.movingVehicleType) lines.push(`Loại xe: ${order.movingVehicleType}`);
  if (order.vehicleTonnage) lines.push(`Tải trọng: ${order.vehicleTonnage} tấn`);
  if (order.tripCount) lines.push(`Số chuyến: ${order.tripCount}`);

  // Cont
  if (order.containerCount) lines.push(`Số cont: ${order.containerCount}`);
  if (order.containerWeight) lines.push(`Khối lượng cont: ${order.containerWeight} tấn`);
  if (order.containerUnit) lines.push(`Đơn vị hàng: ${order.containerUnit}`);

  if (order.rating) lines.push(`Đánh giá: ${order.rating}/5 sao`);

  return lines.join("\n");
}

@injectable()
export class RagSyncService {
  private getVectorStore(provider: RagProvider): Promise<PGVectorStore> {
    return PGVectorStore.initialize(createEmbeddings(provider), {
      pool: getPgVectorPool(),
      tableName: TABLE_NAME,
      // Bảng đã tạo qua migration → bỏ qua bước tự động tạo của LangChain
      skipInitializationCheck: true,
      distanceStrategy: "cosine",
      columns: {
        contentColumnName: CONTENT_COL,
        vectorColumnName: VECTOR_COL,
        metadataColumnName: METADATA_COL,
        idColumnName: ID_COL,
      },
    });
  }

  /**
   * Đồng bộ các ServiceOrder đã COMPLETED chưa sync lên pgvector.
   * Idempotent: chỉ sync khi syncedToVector = false.
   * @param forceResync - true để resync lại tất cả (reset flag)
   * @param limit - số lượng tối đa mỗi lần chạy
   * @param providerOverride - ghi đè provider (để trống = dùng RAG_PROVIDER trong .env)
   */
  async syncPendingOrders(
    forceResync = false,
    limit = config.RAG_SYNC_BATCH_SIZE,
    providerOverride?: RagProvider,
  ): Promise<{ synced: number; failed: number; provider: RagProvider }> {
    const provider = resolveProvider(providerOverride);
    validateProvider(provider);

    const repo = DatabaseConfig.getRepository(ServiceOrder);

    if (forceResync) {
      await repo.update({ syncedToVector: true }, { syncedToVector: false });
      logger.info("[RAG Sync] Reset syncedToVector flags for full resync");
    }

    const orders = await repo.find({
      where: {
        syncedToVector: false,
        // status: OrderStatusEnum.COMPLETED,
      },
      take: limit,
      order: { createdAt: "ASC" },
    });

    if (orders.length === 0) {
      logger.info("[RAG Sync] No pending orders to sync");
      return { synced: 0, failed: 0, provider };
    }

    logger.info(`[RAG Sync] Starting sync for ${orders.length} orders`, { provider });

    const vectorStore = await this.getVectorStore(provider);
    let synced = 0;
    let failed = 0;

    // Xử lý theo batch nhỏ để tránh timeout Gemini embedding
    const BATCH = 20;
    for (let i = 0; i < orders.length; i += BATCH) {
      const batch = orders.slice(i, i + BATCH);
      const docs: Document<IServiceOrderVectorMetadata>[] = batch.map((order) => ({
        pageContent: formatOrderToText(order),
        metadata: {
          serviceOrderId: order.id,
          type: order.type,
          status: order.status,
          amount: order.amount,
          customerId: order.customerId,
          timeAt: order.timeAt ? order.timeAt.toISOString() : "",
        } satisfies IServiceOrderVectorMetadata,
      }));

      // Retry 3 lần với exponential backoff
      let attempt = 0;
      let success = false;
      while (attempt < 3 && !success) {
        try {
          // Pre-validate: embed thủ công để kiểm tra dimension trước khi insert
          const embeddings = createEmbeddings(provider);
          const texts = docs.map((d) => d.pageContent);
          const vectors = await embeddings.embedDocuments(texts);

          const emptyIdx = vectors.findIndex((v) => !v || v.length === 0);
          if (emptyIdx !== -1) {
            throw new Error(
              `[RAG ${provider}] Embedding trả về vector rỗng tại index ${emptyIdx}. Kiểm tra API key và tên model.`,
            );
          }

          await vectorStore.addVectors(vectors, docs);

          // Cập nhật flag syncedToVector = true (raw update để tránh overhead)
          const ids = batch.map((o) => o.id);
          await repo.createQueryBuilder().update(ServiceOrder).set({ syncedToVector: true }).whereInIds(ids).execute();

          synced += batch.length;
          success = true;
        } catch (err) {
          attempt++;
          if (attempt < 3) {
            const delay = 1000 * Math.pow(2, attempt);
            logger.warn(`[RAG Sync] Batch ${i / BATCH + 1} failed (attempt ${attempt}), retry in ${delay}ms`, err);
            await new Promise((r) => setTimeout(r, delay));
          } else {
            logger.error(`[RAG Sync] Batch ${i / BATCH + 1} failed after 3 attempts`, err);
            failed += batch.length;
          }
        }
      }
    }

    logger.info(`[RAG Sync] Done: synced=${synced}, failed=${failed}, provider=${provider}`);
    return { synced, failed, provider };
  }

  /**
   * Upsert một đơn hàng đơn lẻ vào pgvector (dùng khi order vừa được COMPLETED).
   * Xóa vector cũ trước khi insert để đảm bảo idempotent.
   */
  async upsertOrder(order: ServiceOrder, providerOverride?: RagProvider): Promise<void> {
    if (order.status !== ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE) return;

    const provider = resolveProvider(providerOverride);
    validateProvider(provider);
    const pool = getPgVectorPool();

    // Xóa vector cũ nếu có (tìm bằng metadata JSONB)
    await pool.query(`DELETE FROM "${TABLE_NAME}" WHERE "${METADATA_COL}"->>'serviceOrderId' = $1`, [order.id]);

    const vectorStore = await this.getVectorStore(provider);
    const doc: Document<IServiceOrderVectorMetadata> = {
      pageContent: formatOrderToText(order),
      metadata: {
        serviceOrderId: order.id,
        type: order.type,
        status: order.status,
        amount: order.amount,
        customerId: order.customerId,
        timeAt: order.timeAt ? order.timeAt.toISOString() : "",
      },
    };

    await vectorStore.addDocuments([doc]);
    await DatabaseConfig.getRepository(ServiceOrder).update(order.id, { syncedToVector: true });
    logger.info(`[RAG Sync] Upserted order ${order.id}`);
  }
}
