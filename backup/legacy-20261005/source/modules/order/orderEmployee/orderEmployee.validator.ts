import { BaseSchema } from "@/shared/base/BaseSchema";
import { OrderEmployeeStatusEnum } from "@/shared/constants/constance";
import { z } from "zod";

export const CreateOrderEmployeeSchema = z.object({
  orderId: z.uuid().optional(),
  employeeId: z.uuid(),
  timeAt: z.coerce.date().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  breakTime: z.number().min(0).nullish(),
  totalHours: z.number().nullish(),
  salary: z.number().nullish(),
  isLeader: z.boolean().optional(),
  leaderPercentAmount: z.number().nullish(),
  note: z.string().nullish(),
});

export const UpdateOrderEmployeeSchema = z.object({
  employeeId: z.uuid().optional(),
  isLeader: z.boolean().optional(),
  timeAt: z.coerce.date().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  breakTime: z.number().min(0).nullish(),
  totalHours: z.number().nullish(),
  salary: z.number().nullish(),
  leaderPercentAmount: z.number().nullish(),
  note: z.string().nullish(),
});

export const UpdateOrderEmployeeMultiSchema = z.object({
  orderEmployeeIds: z.array(z.uuid()),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  breakTime: z.number().min(0).nullish(),
  totalHours: z.number().nullish(),
  salary: z.number().nullish(),
  leaderPercentAmount: z.number().nullish(),
  note: z.string().nullish(),
});

export const OrderEmployeeCheckoutSchema = z.object({
  breakTime: z.number().min(0),
});

export const OrderEmployeeQuerySchema = BaseSchema.extend({
  sortBy: z.string().default("isLeader").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});

export const OrderEmployeeParamsSchema = z.object({
  id: z.uuid(),
});

export const OrderEmployeeActionParamsSchema = OrderEmployeeParamsSchema.extend(
  {
    orderId: z.uuid(),
  },
);

export const UpdateOrderEmployeeStatusSchema = z.object({
  status: z.enum(OrderEmployeeStatusEnum),
});

export type CreateOrderEmployeeDto = z.infer<typeof CreateOrderEmployeeSchema>;
export type UpdateOrderEmployeeDto = z.infer<typeof UpdateOrderEmployeeSchema>;
export type OrderEmployeeQueryDto = z.infer<typeof OrderEmployeeQuerySchema>;
export type OrderEmployeeParamsDto = z.infer<typeof OrderEmployeeParamsSchema>;
export type UpdateOrderEmployeeStatusDto = z.infer<
  typeof UpdateOrderEmployeeStatusSchema
>;
export type UpdateOrderEmployeeMultiDto = z.infer<
  typeof UpdateOrderEmployeeMultiSchema
>;
export type OrderEmployeeCheckoutDto = z.infer<typeof OrderEmployeeCheckoutSchema>;
