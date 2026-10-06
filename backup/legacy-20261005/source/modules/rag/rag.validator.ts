import { RagDocumentStatus } from "@/database/models/RagDocument";
import { z } from "zod";

export const RagProviderSchema = z.enum(["gemini", "openai"]);

// ─── ServiceOrder Input (cho POST /rag/query) ────────────────────────────────
// Tất cả field đều optional vì đây là đơn hàng mới chưa hoàn chỉnh.
// Chỉ giữ các field liên quan đến định giá, bỏ qua: customerId, status, rating, ...

const IAddressSchema = z
  .object({
    detail: z.string().optional(),
    ward: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

export const ServiceOrderInputSchema = z.object({
  // Chung
  type: z.string().optional(),
  timeAt: z.string().optional(), // ISO string hoặc ngày "dd/MM/yyyy"
  address: IAddressSchema,
  isUrgent: z.boolean().optional(),
  hasFragileItems: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  specialRequirements: z.string().max(500).optional(),
  employeeCount: z.number().optional(),
  needsQuote: z.boolean().optional(),

  // Dịch vụ 1: Bốc xếp theo ca
  shiftCount: z.number().optional(),
  employeeSpecialization: z.string().optional(),

  // Dịch vụ 2: Chuyển nhà / Văn phòng
  floorLocationPickup: z.number().int().optional(),
  hasElevatorPickup: z.boolean().optional(),
  floorLocationDelivery: z.number().int().optional(),
  hasElevatorDelivery: z.boolean().optional(),
  needsWrapping: z.boolean().optional(),
  needsDismantle: z.boolean().optional(),
  movingVehicleType: z.string().optional(),
  vehicleTonnage: z.string().optional(),
  tripCount: z.number().optional(),
  needsCleaning: z.boolean().optional(),
  pickupAddress: IAddressSchema,
  deliveryAddress: IAddressSchema,
  distanceToPickup: z.number().optional(),
  distanceToDelivery: z.number().optional(),

  // Dịch vụ 3: Phá dỡ hoàn trả mặt bằng
  siteType: z.string().optional(),
  siteArea: z.number().optional(),

  // Dịch vụ 5: Nâng hạ cont
  containerCount: z.number().optional(),
  containerUnit: z.string().optional(),
  containerWeight: z.number().optional(),
  containerLocationType: z.string().optional(),
  cargoUnitCount: z.number().optional(),
  contSpecialRequirements: z.string().optional(),

  // Dịch vụ 6: Vận tải
  carType: z.string().optional(),
});

export type ServiceOrderInputDto = z.infer<typeof ServiceOrderInputSchema>;

// ─── Request Schema ─────────────────────────────────────────────────────────

export const RagQuerySchema = z.object({
  serviceOrder: ServiceOrderInputSchema,
  provider: RagProviderSchema.optional(),
  // filters tự động được lấy từ serviceOrder.type; truyền thêm để override nếu cần
  filters: z
    .object({
      type: z.string().optional(),
      status: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    })
    .optional(),
  k: z.coerce.number().int().min(1).max(20).optional().default(5),
});

export type RagQueryDto = z.infer<typeof RagQuerySchema>;

export const RagSyncSchema = z.object({
  provider: RagProviderSchema.optional(),
  forceResync: z.boolean().optional().default(false),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
});

export type RagSyncDto = z.infer<typeof RagSyncSchema>;

// ─── Response Schema (Zod structured output cho LLM) ────────────────────────

export const RagAnswerSchema = z.object({
  answer: z.string().describe("Câu trả lời chi tiết cho câu hỏi của người dùng"),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe(
      "Mức độ tin cậy: high (context đầy đủ), medium (context một phần), low (context yếu hoặc không liên quan)",
    ),
  suggested_price: z
    .number()
    .nullable()
    .describe("Giá đề xuất tính bằng VNĐ nếu câu hỏi liên quan đến định giá, null nếu không"),
  reasoning: z.string().describe("Lý luận ngắn gọn dẫn đến câu trả lời"),
  reference_ids: z.array(z.string()).describe("Danh sách serviceOrderId tham chiếu từ context"),
});

export type RagAnswerDto = z.infer<typeof RagAnswerSchema>;

// ─── Document RAG Schemas ──────────────────────────────────────────────────

export const RagDocumentQuerySchema = z.object({
  query: z.string().min(1).max(5000),
  k: z.coerce.number().int().min(1).max(50).optional().default(5),
  documentIds: z.array(z.string().uuid()).optional(),
  category: z.string().max(255).optional(),
  provider: RagProviderSchema.optional(),
});

export type RagDocumentQueryDto = z.infer<typeof RagDocumentQuerySchema>;

export const RagDocumentListSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(RagDocumentStatus).optional(),
  category: z.string().max(255).optional(),
});

export type RagDocumentListDto = z.infer<typeof RagDocumentListSchema>;

// ─── Document Answer Schema (structured output cho LLM) ────────────────────

export const RagDocumentAnswerSchema = z.object({
  answer: z.string().describe("Câu trả lời chi tiết dựa trên nội dung tài liệu"),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe("Mức độ tin cậy: high (≥5 chunks liên quan), medium (2-4), low (<2)"),
  reasoning: z.string().describe("Lý luận ngắn gọn dẫn đến câu trả lời"),
  reference_document_ids: z.array(z.string()).describe("Danh sách documentId tham chiếu"),
  reference_chunks: z.array(z.number()).describe("Danh sách chunkIndex tham chiếu"),
});

export type RagDocumentAnswerDto = z.infer<typeof RagDocumentAnswerSchema>;
