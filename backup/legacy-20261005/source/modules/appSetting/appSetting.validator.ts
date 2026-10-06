import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { ReferralTypeEnum } from "@/shared/constants/constance";

// ====== Cấu hình đơn hàng ======
export const OrderSettingSchema = z.object({
  // phần trăm VAT
  vat: z.number().min(0).max(100),
  // phần trăm hoa hồng cho nhân viên khi bán hàng
  commission: z.number().min(0).max(100),
  // sai số khoảng cách checkin tối đa cho phép (mét)
  checkInDistanceThreshold: z.number().min(0).default(0),
  // số phút nhắc trước khi đến giờ bắt đầu đơn hàng
  orderStartNotificationMinutes: z.number().int().min(0).default(0),
  // chu kỳ gửi cảnh báo cho đơn gấp (phút)
  urgentOrderAlertIntervalMinutes: z.number().int().min(0).default(0),
  // chu kỳ gửi cảnh báo cho đơn thường (phút)
  regularOrderAlertIntervalMinutes: z.number().int().min(0).default(0),
  // % phân bổ doanh thu cho quản lý chi nhánh
  branchManagerRevenueShare: z.number().min(0).max(100),
  // % phân bổ doanh thu cho kế toán
  accountantRevenueShare: z.number().min(0).max(100),
  // bật/tắt phụ phí cho đơn hàng gấp
  urgentOrderEnabled: z.boolean().default(false),
  // số giờ để xác định đơn hàng gấp
  urgentOrderHours: z.number().min(0).default(0),
  // % phụ phí áp dụng cho đơn hàng gấp
  urgentOrderSurchargePercent: z.number().min(0).max(100).default(0),
  // % phụ phí áp dụng cho hàng dễ vỡ
  fragileItemSurchargePercent: z.number().min(0).max(100).default(0),
});

// ====== Cấu hình khách hàng (giới thiệu) ======
export const CustomerSettingSchema = z.object({
  // số đơn người giới thiệu được thưởng khi khách được giới thiệu đặt đơn hàng
  referralBonus: z.number().min(0),
  // số tiền tối thiểu đặt đơn để người giới thiệu được thưởng
  referralThreshold: z.number().min(0),
});

// ====== Cấu hình nhân viên ======
export const SalesTargetBonusSchema = z.object({
  code: z.string(), // mã cấu hình (dùng để dedupe các bản ghi thưởng đã tạo)
  // loại thưởng phạt
  type: z.nativeEnum(ReferralTypeEnum),
  // số ngày làm việc để đạt được mục tiêu
  daysWorking: z.number().min(0),
  // giá trị thưởng phạt
  bonusValue: z.number(),
  // số ngày tính lao động nghỉ việc (ví dụ 7: tính số nhân viên nghỉ việc trong vòng 7 ngày)
  daysOff: z.number().min(0),
  // số % lao động nghỉ việc để tính vào phạt
  percentOff: z.number().min(0).max(100),
  // số % tiền phạt so với lương tháng
  percentFine: z.number().min(0).max(100),
  // ngày áp dụng cấu hình
  appliedDate: z.coerce.date(),
});

export const TurnoverPenaltySchema = z.object({
  // số ngày tính lao động nghỉ việc
  daysOff: z.number().min(0),
  // số % lao động nghỉ việc để tính vào phạt
  percentOff: z.number().min(0).max(100),
  // số % tiền phạt so với lương tháng
  percentFine: z.number().min(0).max(100),
});

export const EmployeeSettingSchema = z.object({
  // danh sách cấu hình thưởng phạt khi đạt/không đạt mục tiêu doanh số
  salesTargetBonus: z.array(SalesTargetBonusSchema).default([]),
  // cấu hình phạt khi nhân viên nghỉ việc
  turnoverPenalty: TurnoverPenaltySchema,
  // tiền đồng phục
  uniform: z.number().min(0),
  // tiền ký quỹ
  margin: z.number().min(0),
});

// ====== Cấu hình voucher ======
export const VoucherSettingSchema = z.object({
  // số tiền tối thiểu đặt đơn để khách hàng được áp dụng voucher
  minOrderValue: z.number().min(0),
  // quy đổi bao nhiêu tiền trên 1 điểm thưởng
  pointToMoneyRate: z.number().min(0),
});

// ====== Cấu hình thông báo ======
export const NotificationSettingSchema = z.object({
  // danh sách các loại thông báo mà người dùng muốn nhận
  preferences: z.array(z.string()).default([]),
});

// ====== Schemas cho Create/Update ======
export const CreateAppSettingSchema = z.object({
  order: OrderSettingSchema,
  customer: CustomerSettingSchema,
  employee: EmployeeSettingSchema,
  voucher: VoucherSettingSchema,
  notification: NotificationSettingSchema,
  note: z.string().nullish(),
});

export const UpdateAppSettingSchema = z.object({
  order: OrderSettingSchema.optional(),
  customer: CustomerSettingSchema.optional(),
  employee: EmployeeSettingSchema.optional(),
  voucher: VoucherSettingSchema.optional(),
  notification: NotificationSettingSchema.optional(),
  note: z.string().nullish(),
});

export const AppSettingQuerySchema = BaseSchema.extend({});

export const AppSettingParamsSchema = z.object({
  id: z.uuid(),
});

export type OrderSettingDto = z.infer<typeof OrderSettingSchema>;
export type CustomerSettingDto = z.infer<typeof CustomerSettingSchema>;
export type SalesTargetBonusDto = z.infer<typeof SalesTargetBonusSchema>;
export type TurnoverPenaltyDto = z.infer<typeof TurnoverPenaltySchema>;
export type EmployeeSettingDto = z.infer<typeof EmployeeSettingSchema>;
export type VoucherSettingDto = z.infer<typeof VoucherSettingSchema>;
export type NotificationSettingDto = z.infer<typeof NotificationSettingSchema>;
export type CreateAppSettingDto = z.infer<typeof CreateAppSettingSchema>;
export type UpdateAppSettingDto = z.infer<typeof UpdateAppSettingSchema>;
export type AppSettingQueryDto = z.infer<typeof AppSettingQuerySchema>;
export type AppSettingParamsDto = z.infer<typeof AppSettingParamsSchema>;
