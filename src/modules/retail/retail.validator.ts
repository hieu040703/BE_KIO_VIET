import { z } from "zod";

export const RetailResourceParamsSchema = z.object({
  resource: z.string().min(1),
});

export const RetailIdParamsSchema = RetailResourceParamsSchema.extend({
  id: z.uuid(),
});

export const RetailQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().trim().optional(),
});

export const RetailBodySchema = z.record(z.string(), z.unknown());

export const RetailCheckoutSchema = z.object({
  branchId: z.uuid(),
  warehouseId: z.uuid().optional(),
  cashSessionId: z.uuid().optional(),
  customerId: z.uuid().optional(),
  priceBookId: z.uuid().optional(),
  promotionId: z.uuid().optional(),
  couponCode: z.string().trim().min(1).max(80).optional(),
  orderCode: z.string().trim().min(1).max(60).optional(),
  paymentMethodId: z.uuid().optional(),
  paymentMethod: z.string().trim().min(1).max(80).optional(),
  paidAmount: z.number().nonnegative().optional(),
  items: z.array(z.object({
    variantId: z.uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    discountTotal: z.number().nonnegative().default(0),
    taxTotal: z.number().nonnegative().default(0),
  })).min(1),
});

export const RetailCashSessionOpenSchema = z.object({
  cashRegisterId: z.uuid(),
  openingAmount: z.number().nonnegative().default(0),
  code: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(255).optional(),
});

export const RetailCashSessionCloseSchema = z.object({
  closingAmount: z.number().nonnegative(),
  note: z.string().trim().max(255).optional(),
});

export const RetailAttendancePunchSchema = z.object({
  employeeId: z.uuid(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "workDate must use YYYY-MM-DD"),
  shiftId: z.uuid().optional(),
  action: z.enum(["CHECK_IN", "CHECK_OUT"]),
  at: z.string().optional(),
});

export const RetailPayrollGenerateSchema = z.object({
  payrollPeriodId: z.uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must use YYYY-MM-DD").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must use YYYY-MM-DD").optional(),
  employeeIds: z.array(z.uuid()).optional(),
});

export const RetailGiftCardIssueSchema = z.object({
  code: z.string().trim().min(1).max(80),
  amount: z.number().positive(),
  customerId: z.uuid().optional(),
  expiresAt: z.string().optional(),
});

export const RetailGiftCardRedeemSchema = z.object({
  code: z.string().trim().min(1).max(80).optional(),
  giftCardId: z.uuid().optional(),
  amount: z.number().positive(),
  orderId: z.uuid().optional(),
});

export const RetailVoucherIssueSchema = z.object({
  code: z.string().trim().min(1).max(80),
  amount: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

export const RetailVoucherRedeemSchema = z.object({
  code: z.string().trim().min(1),
  amount: z.number().positive(),
  orderId: z.uuid().optional(),
});

export const RetailInventoryAdjustmentSchema = z.object({
  warehouseId: z.uuid(),
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().min(1).max(255).optional(),
  items: z.array(z.object({
    variantId: z.uuid(),
    quantityDelta: z.number().refine((value) => value !== 0, "quantityDelta must not be zero"),
    unitCost: z.number().nonnegative().optional(),
  })).min(1),
});

export const RetailStockCountSchema = z.object({
  warehouseId: z.uuid(),
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().max(255).optional(),
  items: z.array(z.object({
    variantId: z.uuid(),
    countedQuantity: z.number().nonnegative(),
    unitCost: z.number().nonnegative().optional(),
  })).min(1),
});

const RetailStockMovementItemSchema = z.object({
  variantId: z.uuid(),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative().optional(),
});

export const RetailInventoryTransferSchema = z.object({
  fromWarehouseId: z.uuid(),
  toWarehouseId: z.uuid(),
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().min(1).max(255).optional(),
  items: z.array(RetailStockMovementItemSchema).min(1),
});

export const RetailGoodsReceiptSchema = z.object({
  warehouseId: z.uuid(),
  supplierId: z.uuid().optional(),
  purchaseOrderId: z.uuid().optional(),
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().min(1).max(255).optional(),
  items: z.array(RetailStockMovementItemSchema).min(1),
});

export const RetailPurchaseOrderCreateSchema = z.object({
  warehouseId: z.uuid(),
  supplierId: z.uuid().optional(),
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().max(255).optional(),
  items: z.array(RetailStockMovementItemSchema).min(1),
});

export const RetailPurchaseReturnSchema = z.object({
  warehouseId: z.uuid(),
  goodsReceiptId: z.uuid(),
  supplierId: z.uuid().optional(),
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().min(1).max(255).optional(),
  items: z.array(z.object({
    goodsReceiptItemId: z.uuid(),
    quantity: z.number().positive(),
    unitCost: z.number().nonnegative().optional(),
  })).min(1),
});

export const RetailOrderCancelSchema = z.object({
  reason: z.string().trim().min(1).max(255).optional(),
});

export const RetailOrderShipSchema = z.object({
  shippingProviderId: z.uuid().optional(),
  trackingCode: z.string().trim().max(120).optional(),
  recipientName: z.string().trim().max(160).optional(),
  recipientPhone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  code: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(255).optional(),
});

export const RetailOrderDeliverSchema = z.object({
  note: z.string().trim().max(255).optional(),
});

export const RetailOrderCancelParamsSchema = z.object({ id: z.uuid() });

export const RetailSalesReturnSchema = z.object({
  code: z.string().trim().min(1).max(80).optional(),
  reason: z.string().trim().min(1).max(255).optional(),
  items: z.array(z.object({ orderItemId: z.uuid(), quantity: z.number().positive() })).min(1),
});

export const RetailExchangeSchema = z.object({
  code: z.string().trim().min(1).max(50).optional(),
  reason: z.string().trim().min(1).max(255).optional(),
  items: z.array(z.object({ orderItemId: z.uuid(), quantity: z.number().positive() })).min(1),
  replacementItems: z.array(z.object({
    variantId: z.uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative().optional(),
  })).min(1),
  paymentMethodId: z.uuid().optional(),
  paymentMethod: z.string().trim().min(1).max(80).optional(),
  paidAmount: z.number().nonnegative().optional(),
});

export const RetailCustomerDebtPaymentSchema = z.object({
  customerId: z.uuid(),
  amount: z.number().positive(),
  paymentMethodId: z.uuid().optional(),
  paymentMethod: z.string().trim().min(1).max(80).optional(),
  code: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(255).optional(),
});

export const RetailSupplierDebtPaymentSchema = z.object({
  supplierId: z.uuid(),
  amount: z.number().positive(),
  paymentMethodId: z.uuid().optional(),
  paymentMethod: z.string().trim().min(1).max(80).optional(),
  code: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(255).optional(),
});

export const RetailReconciliationSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must use YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must use YYYY-MM-DD"),
  paymentMethodId: z.uuid().optional(),
});

export type RetailQueryDto = z.infer<typeof RetailQuerySchema>;
export type RetailCheckoutDto = z.infer<typeof RetailCheckoutSchema>;
export type RetailCashSessionOpenDto = z.infer<typeof RetailCashSessionOpenSchema>;
export type RetailCashSessionCloseDto = z.infer<typeof RetailCashSessionCloseSchema>;
export type RetailAttendancePunchDto = z.infer<typeof RetailAttendancePunchSchema>;
export type RetailPayrollGenerateDto = z.infer<typeof RetailPayrollGenerateSchema>;
export type RetailGiftCardIssueDto = z.infer<typeof RetailGiftCardIssueSchema>;
export type RetailGiftCardRedeemDto = z.infer<typeof RetailGiftCardRedeemSchema>;
export type RetailVoucherIssueDto = z.infer<typeof RetailVoucherIssueSchema>;
export type RetailVoucherRedeemDto = z.infer<typeof RetailVoucherRedeemSchema>;
export type RetailInventoryAdjustmentDto = z.infer<typeof RetailInventoryAdjustmentSchema>;
export type RetailStockCountDto = z.infer<typeof RetailStockCountSchema>;
export type RetailInventoryTransferDto = z.infer<typeof RetailInventoryTransferSchema>;
export type RetailGoodsReceiptDto = z.infer<typeof RetailGoodsReceiptSchema>;
export type RetailPurchaseOrderCreateDto = z.infer<typeof RetailPurchaseOrderCreateSchema>;
export type RetailPurchaseReturnDto = z.infer<typeof RetailPurchaseReturnSchema>;
export type RetailOrderCancelDto = z.infer<typeof RetailOrderCancelSchema>;
export type RetailOrderShipDto = z.infer<typeof RetailOrderShipSchema>;
export type RetailOrderDeliverDto = z.infer<typeof RetailOrderDeliverSchema>;
export type RetailSalesReturnDto = z.infer<typeof RetailSalesReturnSchema>;
export type RetailExchangeDto = z.infer<typeof RetailExchangeSchema>;
export type RetailCustomerDebtPaymentDto = z.infer<typeof RetailCustomerDebtPaymentSchema>;
export type RetailSupplierDebtPaymentDto = z.infer<typeof RetailSupplierDebtPaymentSchema>;
export type RetailReconciliationDto = z.infer<typeof RetailReconciliationSchema>;
