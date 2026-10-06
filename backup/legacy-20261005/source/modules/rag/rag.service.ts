import { injectable, inject } from "inversify";
import { RAG_TYPES } from "./rag.types";
import { RagSyncService } from "./rag.sync.service";
import { RagChainService } from "./rag.chain.service";
import { RagCacheService } from "./rag.cache.service";
import type { RagQueryDto, RagAnswerDto, RagSyncDto, ServiceOrderInputDto } from "./rag.validator";
import logger from "@/shared/utils/logger";

export interface RagQueryResult {
  data: RagAnswerDto;
  query_hash: string;
  cache_hit: boolean;
  latency_ms: number;
  derived_query: string;
}

export interface RagSyncResult {
  synced: number;
  failed: number;
  provider: string;
}

/**
 * Chuyển đổi ServiceOrderInput thành câu hỏi tự nhiên gửi vào RAG.
 * Format: mô tả chi tiết đơn hàng + yêu cầu gợi ý giá.
 */
function buildQueryFromOrder(order: ServiceOrderInputDto): string {
  const lines: string[] = [];

  const typeLabel: Record<string, string> = {
    BOC_XEP_THEO_CA: "Bốc xếp theo ca",
    CHUYEN_NHA_VAN_PHONG: "Chuyển nhà / văn phòng trọn gói",
    PHA_DO_HOAN_TRA: "Phá dỡ hoàn trả mặt bằng",
    VAN_CHUYEN_VAT_TU: "Vận chuyển vật tư",
    NANG_HA_CONT: "Nâng hạ cont hàng",
    DICH_VU_VAN_TAI: "Dịch vụ vận tải",
    VE_SINH_CONG_NGHIEP: "Vệ sinh công nghiệp",
  };

  if (order.type) lines.push(`Loại dịch vụ: ${typeLabel[order.type] ?? order.type}`);

  if (order.timeAt) {
    const d = new Date(order.timeAt);
    const dateStr = isNaN(d.getTime()) ? order.timeAt : d.toLocaleDateString("vi-VN");
    lines.push(`Thời gian thực hiện: ${dateStr}`);
  }

  // Địa chỉ chính
  if (order.address) {
    const addr = [order.address.detail, order.address.ward, order.address.district, order.address.state]
      .filter(Boolean)
      .join(", ");
    if (addr) lines.push(`Địa chỉ: ${addr}`);
  }

  // Điểm lấy / giao (chuyển nhà, vận chuyển vật tư, vận tải)
  if (order.pickupAddress) {
    const addr = [
      order.pickupAddress.detail,
      order.pickupAddress.ward,
      order.pickupAddress.district,
      order.pickupAddress.state,
    ]
      .filter(Boolean)
      .join(", ");
    if (addr) lines.push(`Điểm lấy hàng: ${addr}`);
  }
  if (order.deliveryAddress) {
    const addr = [
      order.deliveryAddress.detail,
      order.deliveryAddress.ward,
      order.deliveryAddress.district,
      order.deliveryAddress.state,
    ]
      .filter(Boolean)
      .join(", ");
    if (addr) lines.push(`Điểm giao hàng: ${addr}`);
  }
  if (order.distanceToPickup) lines.push(`Khoảng cách đến điểm lấy: ${order.distanceToPickup}m`);
  if (order.distanceToDelivery) lines.push(`Khoảng cách đến điểm giao: ${order.distanceToDelivery}m`);

  if (order.isUrgent !== undefined) lines.push(`Đặt gấp (< 2 tiếng): ${order.isUrgent ? "Có" : "Không"}`);
  if (order.hasFragileItems !== undefined) lines.push(`Hàng dễ vỡ: ${order.hasFragileItems ? "Có" : "Không"}`);
  if (order.employeeCount) lines.push(`Số nhân viên yêu cầu: ${order.employeeCount}`);
  if (order.employeeSpecialization) lines.push(`Chuyên ngành nhân viên: ${order.employeeSpecialization}`);
  if (order.description) lines.push(`Mô tả: ${order.description}`);
  if (order.specialRequirements) lines.push(`Yêu cầu đặc biệt: ${order.specialRequirements}`);

  // Dịch vụ 1: Bốc xếp theo ca
  if (order.shiftCount) lines.push(`Số ca: ${order.shiftCount}`);

  // Dịch vụ 2: Chuyển nhà
  if (order.floorLocationPickup !== undefined)
    lines.push(
      `Tầng lấy hàng: ${order.floorLocationPickup}${order.hasElevatorPickup !== undefined ? (order.hasElevatorPickup ? " (có thang máy)" : " (không có thang máy)") : ""}`,
    );
  if (order.floorLocationDelivery !== undefined)
    lines.push(
      `Tầng giao hàng: ${order.floorLocationDelivery}${order.hasElevatorDelivery !== undefined ? (order.hasElevatorDelivery ? " (có thang máy)" : " (không có thang máy)") : ""}`,
    );
  if (order.movingVehicleType) lines.push(`Loại xe: ${order.movingVehicleType}`);
  if (order.vehicleTonnage) lines.push(`Tải trọng xe: ${order.vehicleTonnage} tấn`);
  if (order.tripCount) lines.push(`Số chuyến ước tính: ${order.tripCount}`);
  if (order.needsWrapping !== undefined) lines.push(`Yêu cầu bọc lót đồ: ${order.needsWrapping ? "Có" : "Không"}`);
  if (order.needsDismantle !== undefined) lines.push(`Yêu cầu tháo lắp: ${order.needsDismantle ? "Có" : "Không"}`);
  if (order.needsCleaning !== undefined) lines.push(`Vệ sinh sau chuyển: ${order.needsCleaning ? "Có" : "Không"}`);

  // Dịch vụ 3: Phá dỡ
  if (order.siteType) lines.push(`Loại mặt bằng: ${order.siteType}`);
  if (order.siteArea) lines.push(`Diện tích: ${order.siteArea} m²`);

  // Dịch vụ 5: Nâng hạ cont
  if (order.containerCount) lines.push(`Số cont: ${order.containerCount}`);
  if (order.containerWeight) lines.push(`Khối lượng hàng: ${order.containerWeight} tấn`);
  if (order.containerUnit) lines.push(`Đơn vị hàng: ${order.containerUnit}`);
  if (order.containerLocationType) lines.push(`Hình thức cont: ${order.containerLocationType}`);
  if (order.cargoUnitCount) lines.push(`Số kiện / thùng: ${order.cargoUnitCount}`);
  if (order.contSpecialRequirements) lines.push(`Yêu cầu đặc biệt cont: ${order.contSpecialRequirements}`);

  // Dịch vụ 6: Vận tải
  if (order.carType) lines.push(`Loại xe vận tải: ${order.carType}`);

  const description = lines.join("\n");
  return `Đây là thông tin đơn hàng mới cần báo giá:\n${description}\n\nDựa trên dữ liệu các đơn hàng tương tự đã hoàn thành, hãy gợi ý mức giá hợp lý và lý giải cụ thể.`;
}

@injectable()
export class RagService {
  constructor(
    @inject(RAG_TYPES.RagSyncService) private readonly syncService: RagSyncService,
    @inject(RAG_TYPES.RagChainService) private readonly chainService: RagChainService,
    @inject(RAG_TYPES.RagCacheService) private readonly cacheService: RagCacheService,
  ) {}

  /**
   * Xử lý RAG query với cache → chain fallback.
   * Tự động chuyển ServiceOrderInput → câu truy vấn tự nhiên trước khi gửi LLM.
   */
  async query(dto: RagQueryDto): Promise<RagQueryResult> {
    const start = Date.now();

    // Chuyển ServiceOrder → query string
    const derivedQuery = buildQueryFromOrder(dto.serviceOrder);

    // Tự động lấy filter type từ serviceOrder nếu không truyền
    const filters = dto.filters ?? (dto.serviceOrder.type ? { type: dto.serviceOrder.type } : undefined);

    // 1. Thử cache trước
    const cached = await this.cacheService.get(dto);
    if (cached) {
      const latency_ms = Date.now() - start;
      logger.info("[RAG] Cache hit", {
        query_hash: cached.query_hash,
        latency_ms,
        confidence: cached.data.confidence,
        reference_ids: cached.data.reference_ids,
      });
      return {
        data: cached.data,
        query_hash: cached.query_hash,
        cache_hit: true,
        latency_ms,
        derived_query: derivedQuery,
      };
    }

    // 2. Gọi LangChain chain
    const answer = await this.chainService.query(derivedQuery, filters, dto.k, dto.provider);

    const latency_ms = Date.now() - start;

    // 3. Lưu vào cache
    const query_hash = await this.cacheService.set(dto, answer);

    logger.info("[RAG] Chain executed", {
      query_hash,
      latency_ms,
      confidence: answer.confidence,
      reference_ids: answer.reference_ids,
      order_type: dto.serviceOrder.type,
    });

    return { data: answer, query_hash, cache_hit: false, latency_ms, derived_query: derivedQuery };
  }

  /**
   * Trigger đồng bộ ServiceOrder → pgvector.
   */
  async sync(dto: RagSyncDto): Promise<RagSyncResult> {
    logger.info("[RAG] Starting sync", { forceResync: dto.forceResync, limit: dto.limit, provider: dto.provider });
    const result = await this.syncService.syncPendingOrders(dto.forceResync, dto.limit, dto.provider);
    return result;
  }
}
