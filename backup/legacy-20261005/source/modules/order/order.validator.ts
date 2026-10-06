import { z } from "@/shared/utils/zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import { AddressSchema } from "../common/common.validator";
import { OrderStatusEnum } from "@/shared/constants/constance";
import { CreateOrderDetailSchema } from "./orderDetail/orderDetail.validator";
import { BaseQueue } from "@/queue";

export const CreateOrderSchema = z
  .object({
    serviceOrderId: z.uuid().optional(),
    branchId: z.uuid(),
    branchManagerId: z.uuid(),
    allocateRevenuePercent: z.number().min(0).max(100).optional(),
    name: z.string().max(255),
    code: z.string().max(50).optional(),
    customerId: z.uuid(),
    customerEmail: z.string().nullish(),
    customerPhone: z.string().max(50).nullish(),
    customerTaxCode: z.string().max(20).nullish(),
    referrerId: z.uuid().nullish(),
    referrerPercent: z.number().nullish(),
    referrerAmount: z.number().nullish(),
    createdByEmployeeId: z.uuid().nullish(),
    createdByEmployeePercent: z.number().min(0).max(100).optional(),
    timeAt: z.coerce.date(),
    estimatedCompletionAt: z.coerce.date().nullish(),
    address: AddressSchema,
    deliveryAddress: AddressSchema.optional(),
    employeeCount: z.number().default(1).optional(),
    description: z.string().nullish(),
    status: z.enum(OrderStatusEnum).optional(),
    link: z.string().nullish(),
    preVatAmount: z.number().nullish(),
    discountPercent: z.number().nullish(),
    discountAmount: z.number().nullish(),
    vat: z.number().nullish(),
    vatAmount: z.number().nullish(),
    amount: z.number().optional(),
    isInvoiced: z.boolean().optional(),
    invoiceNumber: z.string().nullish(),
    invoiceDate: z.coerce.date().nullish(),
    deposit: z.number().nullish(),
    isPaid: z.boolean().optional(),
    note: z.string().nullish(),
    tempId: z.uuid().optional(),
    isUrgent: z.boolean().optional().default(false),
    details: z.array(CreateOrderDetailSchema.omit({ orderId: true })).optional(),
    orderLeaders: z.array(z.object({ employeeId: z.uuid() })).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.estimatedCompletionAt && data.estimatedCompletionAt.getTime() <= data.timeAt.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["estimatedCompletionAt"],
        message: "Thời gian hoàn thành phải sau thời gian bắt đầu",
      });
    }
  });

export const UpdateOrderSchema = z
  .object({
    branchId: z.uuid().optional(),
    allocateRevenuePercent: z.number().min(0).max(100).optional(),
    name: z.string().max(255).optional(),
    code: z.string().max(50).optional(),
    customerId: z.uuid().optional(),
    customerEmail: z.string().nullish(),
    customerPhone: z.string().max(50).nullish(),
    customerTaxCode: z.string().max(20).nullish(),
    timeAt: z.coerce.date().optional(),
    estimatedCompletionAt: z.coerce.date().nullish(),
    address: AddressSchema.optional(),
    deliveryAddress: AddressSchema.optional(),
    amount: z.number().optional(),
    discountPercent: z.number().optional(),
    discountAmount: z.number().optional(),
    employeeCount: z.number().optional(),
    branchManagerId: z.uuid().nullish(),
    referrerId: z.uuid().nullish(),
    referrerPercent: z.number().nullish(),
    referrerAmount: z.number().nullish(),
    description: z.string().nullish(),
    status: z.enum(OrderStatusEnum).optional(),
    link: z.string().nullish(),
    vat: z.number().nullish(),
    isInvoiced: z.boolean().optional(),
    invoiceNumber: z.string().nullish(),
    invoiceDate: z.coerce.date().nullish(),
    deposit: z.number().nullish(),
    isPaid: z.boolean().optional(),
    note: z.string().nullish(),
    tempId: z.uuid().optional(),
    isUrgent: z.boolean().optional(),
    orderLeaders: z.array(z.object({ employeeId: z.uuid() })).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.timeAt && data.estimatedCompletionAt && data.estimatedCompletionAt.getTime() <= data.timeAt.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["estimatedCompletionAt"],
        message: "Thời gian hoàn thành phải sau thời gian bắt đầu",
      });
    }
  });

export const OrderQuerySchema = BaseSchema.omit({ type: true }).extend({
  customerIds: z.array(z.uuid()).optional(),
  employeeIds: z.array(z.uuid()).optional(),
  branchIds: z.array(z.uuid()).optional(),
  referrerIds: z.array(z.uuid()).optional(),
  status: z.enum(OrderStatusEnum).optional(),
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
  isPaid: z.transformBoolean().optional(),
  isVat: z.transformBoolean().optional(),
  isInvoiced: z.transformBoolean().optional(),
});

export const OrderParamsSchema = z.object({
  id: z.uuid(),
});

export const OrderIdParamSchema = z.object({
  orderId: z.uuid(),
});

export const ClientOrderQuerySchema = BaseSchema.extend({
  page: z.coerce.number().min(1).optional().default(1),
  size: z.coerce.number().min(1).max(100).optional().default(20),
  keyword: z.string().max(255).optional(),
  sortBy: z.string().default("timeAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
  customerId: z.uuid().optional(),
});

export type CreateOrderDto = import("zod").infer<typeof CreateOrderSchema>;
export type UpdateOrderDto = import("zod").infer<typeof UpdateOrderSchema>;
export type OrderQueryDto = import("zod").infer<typeof OrderQuerySchema>;
export type OrderParamsDto = import("zod").infer<typeof OrderParamsSchema>;
export type OrderIdParamDto = import("zod").infer<typeof OrderIdParamSchema>;
export type ClientOrderQueryDto = import("zod").infer<typeof ClientOrderQuerySchema>;

export const AdminOrderCheckInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type AdminOrderCheckInDto = import("zod").infer<typeof AdminOrderCheckInSchema>;
