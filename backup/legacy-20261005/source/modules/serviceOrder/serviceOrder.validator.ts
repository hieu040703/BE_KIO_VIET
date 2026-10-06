import { z } from "zod";
import { BaseSchema } from "@/shared/base/BaseSchema";
import {
  DocumentRequirementEnum,
  OrderFeeCategoryCodeEnum,
  ServiceOrderStatusEnum,
  ServiceOrderTypeEnum,
} from "@/shared/constants/constance";
import { AddressSchema } from "../common/common.validator";

const arrayOrNull = (schema: z.ZodArray<any>) =>
  z.preprocess((val) => {
    if (val === "" || val === "[]" || val === null || val === undefined) {
      return null;
    }

    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }

    return val;
  }, schema.nullable());

const ItemDetailSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string().nullish(),
  note: z.string().nullish(),
});

const ServicePriceSchema = z.object({
  name: z.string(),
  quantity: z.number().optional(),
  unit: z.string().nullish(),
  price: z.number(),
  note: z.string().nullish(),
});

export const QuoteItemSchema = z.object({
  key: z.string().trim().min(1),
  value: z.number().min(0),
  code: z.enum(OrderFeeCategoryCodeEnum).nullable(),
  type: z.enum(["inc", "dec"]),
  note: z.string().nullish(),
});

const SelectedServicePriceSchema = z.object({
  servicePriceId: z.uuid(),
  quantity: z.number().positive().optional(),
});

export const CreateServiceOrderSchema = z.object({
  customerId: z.uuid().optional(), //? có thể được gán tự động từ req.user
  branchId: z.uuid().nullish(), //? được tự động gán theo chi nhánh gần nhất nếu có tọa độ
  branchManagerId: z.uuid().nullish(), //? có thể được gán sau khi tạo đơn hoặc để null nếu chưa có nhân viên phụ trách
  employeeId: z.uuid().nullish(), //? có thể được gán sau khi tạo đơn hoặc để null nếu chưa có nhân viên phụ trách
  type: z.enum(ServiceOrderTypeEnum),
  timeAt: z.coerce.date(),
  address: AddressSchema,

  isUrgent: z.boolean().optional(),
  hasFragileItems: z.boolean().optional(),

  basePrice: z.number().nullish(),
  vouchersId: z.uuid().nullish(),
  preVatAmount: z.number().nullish(),
  hasVat: z.boolean().optional(),
  vat: z.number().nullish(),
  vatAmount: z.number().nullish(),
  amount: z.number().nullish(),

  isDebt: z.boolean().optional(),
  needsQuote: z.boolean().optional(),
  documentRequirement: z.enum(DocumentRequirementEnum).nullish(),
  contactName: z.string().max(255).nullish(),
  contactPhone: z.string().max(50).nullish(),
  status: z.enum(ServiceOrderStatusEnum).optional(),
  rating: z.number().nullish(),

  description: z.string().nullish(),

  specialRequirements: z.string().nullish(),
  employeeSpecialization: z.string().max(255).nullish(),
  employeeCount: z.number().nullish(),

  floorLocationPickup: z.number().nullish(),
  hasElevatorPickup: z.boolean().nullish(),
  floorLocationDelivery: z.number().nullish(),
  hasElevatorDelivery: z.boolean().nullish(),

  itemsDetail: z.array(ItemDetailSchema).nullish(),
  needsWrapping: z.boolean().nullish(),
  needsDismantle: z.boolean().nullish(),
  needsCleaning: z.boolean().nullish(),
  movingVehicleType: z.string().nullish(),
  vehicleTonnage: z.string().nullish(),
  tripCount: z.number().nullish(),

  pickupAddress: AddressSchema.nullish(),
  distanceToPickup: z.number().nullish(),
  deliveryAddress: AddressSchema.nullish(),
  distanceToDelivery: z.number().nullish(),

  siteType: z.string().max(255).nullish(),
  siteArea: z.number().nullish(),

  materialsDetail: z.array(ItemDetailSchema).nullish(),

  containerCount: z.number().nullish(),
  cargoUnitCount: z.number().nullish(),
  containerUnit: z.string().nullish(),
  containerWeight: z.number().nullish(),
  containerLocationType: z.string().nullish(),
  distanceToStorage: z.number().nullish(),
  contSpecialRequirements: z.string().nullish(),
  needsForklift: z.boolean().nullish(),
  forkliftCount: z.number().nullish(),
  needsCrane: z.boolean().nullish(),
  craneCount: z.number().nullish(),

  carType: z.string().max(255).nullish(),

  quote: z.array(QuoteItemSchema).nullish(),

  servicePrices: z.array(ServicePriceSchema).nullish(),

  tempId: z.uuid().optional(),
});

export const UpdateServiceOrderSchema = z.object({
  customerId: z.uuid().optional(),
  branchId: z.uuid().nullish(),
  employeeId: z.uuid().nullish(),
  branchManagerId: z.uuid().nullish(),
  type: z.enum(ServiceOrderTypeEnum).optional(),
  timeAt: z.coerce.date().optional(),
  address: AddressSchema.optional(),

  isUrgent: z.boolean().optional(),
  hasFragileItems: z.boolean().optional(),

  basePrice: z.number().nullish(),
  vouchersId: z.uuid().nullish(),
  preVatAmount: z.number().nullish(),
  hasVat: z.boolean().optional(),
  vat: z.number().nullish(),
  vatAmount: z.number().nullish(),
  amount: z.number().nullish(),

  isDebt: z.boolean().optional(),
  needsQuote: z.boolean().optional(),
  documentRequirement: z.enum(DocumentRequirementEnum).nullish(),
  contactName: z.string().max(255).nullish(),
  contactPhone: z.string().max(50).nullish(),
  status: z.enum(ServiceOrderStatusEnum).optional(),
  rating: z.number().nullish(),

  description: z.string().nullish(),

  specialRequirements: z.string().nullish(),
  employeeSpecialization: z.string().max(255).nullish(),
  employeeCount: z.number().nullish(),

  floorLocationPickup: z.number().nullish(),
  hasElevatorPickup: z.boolean().nullish(),
  floorLocationDelivery: z.number().nullish(),
  hasElevatorDelivery: z.boolean().nullish(),

  itemsDetail: z.array(ItemDetailSchema).nullish(),
  needsWrapping: z.boolean().nullish(),
  needsDismantle: z.boolean().nullish(),
  needsCleaning: z.boolean().nullish(),
  movingVehicleType: z.string().nullish(),
  vehicleTonnage: z.string().nullish(),
  tripCount: z.number().nullish(),

  pickupAddress: AddressSchema.nullish(),
  distanceToPickup: z.number().nullish(),
  deliveryAddress: AddressSchema.nullish(),
  distanceToDelivery: z.number().nullish(),

  siteType: z.string().max(255).nullish(),
  siteArea: z.number().nullish(),

  materialsDetail: z.array(ItemDetailSchema).nullish(),

  containerCount: z.number().nullish(),
  cargoUnitCount: z.number().nullish(),
  containerUnit: z.string().nullish(),
  containerWeight: z.number().nullish(),
  containerLocationType: z.string().nullish(),
  distanceToStorage: z.number().nullish(),
  contSpecialRequirements: z.string().nullish(),
  needsForklift: z.boolean().nullish(),
  forkliftCount: z.number().nullish(),
  needsCrane: z.boolean().nullish(),
  craneCount: z.number().nullish(),

  carType: z.string().max(255).nullish(),

  quote: z.array(QuoteItemSchema).nullish(),

  servicePrices: z.array(ServicePriceSchema).nullish(),

  tempId: z.uuid().optional(),
});

export const ServiceOrderQuerySchema = BaseSchema.extend({
  customerId: z.uuid().optional(),
  type: z.enum(ServiceOrderTypeEnum).optional(),
  status: z.enum(ServiceOrderStatusEnum).optional(),
});

export const ServiceOrderParamsSchema = z.object({
  id: z.uuid(),
});

export const ConfirmServiceOrderSchema = z.object({
  branchId: z.uuid(),
  branchManagerId: z.uuid(),
  employeeId: z.uuid(),
});

export const CustomerConfirmCompletedServiceOrderSchema = z.object({
  content: z.string().trim().nullish(),
  attachments: arrayOrNull(z.array(z.any())).optional(),
});

const CustomerServiceOrderEmployeeRatingSchema = z.object({
  employeeId: z.uuid(),
  rating: z.coerce.number().min(1).max(5),
  review: z.string().trim().nullish(),
  note: z.string().trim().nullish(),
});

export const CustomerCreateServiceOrderRatingSchema = z
  .object({
    rating: z.coerce.number().min(1).max(5).optional(),
    review: z.string().trim().nullish(),
    note: z.string().trim().nullish(),
    employeeRatings: z.array(CustomerServiceOrderEmployeeRatingSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const hasOverallRating = typeof data.rating === "number";
    const hasEmployeeRatings = Array.isArray(data.employeeRatings) && data.employeeRatings.length > 0;

    if (!hasOverallRating && !hasEmployeeRatings) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "rating_or_employee_ratings_required",
        path: ["rating"],
      });
    }
  });

// submit-quote không nhận body — quote/amount đã được lưu qua PUT trước đó
export const SubmitQuoteSchema = z.object({});

export const CustomerConfirmQuoteSchema = z.object({
  content: z.string().trim().nullish(),
});

export const CustomerEstimateServiceOrderPriceSchema = z.object({
  type: z.enum(ServiceOrderTypeEnum),
  serviceId: z.uuid(),
  timeAt: z.coerce.date(),
  address: AddressSchema,
  hasVat: z.boolean().optional(),
  hasFragileItems: z.boolean().optional(),
  employeeCount: z.number().nullish(),
  pickupAddress: AddressSchema.nullish(),
  deliveryAddress: AddressSchema.nullish(),
  vouchersId: z.uuid().nullish(),
  servicePrices: z.array(SelectedServicePriceSchema).min(1),
});

export const CustomerCreateServiceOrderSchema = CreateServiceOrderSchema.omit({
  customerId: true,
  branchId: true,
  employeeId: true,
  branchManagerId: true,
  isUrgent: true,
  basePrice: true,
  quote: true,
  preVatAmount: true,
  vat: true,
  vatAmount: true,
  amount: true,
  status: true,
}).extend({
  serviceId: z.uuid(),
  servicePrices: z.array(SelectedServicePriceSchema).nullish(),
});

export const CustomerUpdateServiceOrderSchema = UpdateServiceOrderSchema.omit({
  customerId: true,
  branchId: true,
  employeeId: true,
  branchManagerId: true,
  isUrgent: true,
  basePrice: true,
  quote: true,
  preVatAmount: true,
  vat: true,
  vatAmount: true,
  amount: true,
  status: true,
  servicePrices: true,
});

export const AdminServiceOrderCheckInSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});
export type AdminServiceOrderCheckInDto = z.infer<typeof AdminServiceOrderCheckInSchema>;

export type CreateServiceOrderDto = z.infer<typeof CreateServiceOrderSchema>;
export type UpdateServiceOrderDto = z.infer<typeof UpdateServiceOrderSchema>;
export type ServiceOrderQueryDto = z.infer<typeof ServiceOrderQuerySchema>;
export type ServiceOrderParamsDto = z.infer<typeof ServiceOrderParamsSchema>;
export type ConfirmServiceOrderDto = z.infer<typeof ConfirmServiceOrderSchema>;
export type CustomerConfirmCompletedServiceOrderDto = z.infer<typeof CustomerConfirmCompletedServiceOrderSchema>;
export type CustomerCreateServiceOrderRatingDto = z.infer<typeof CustomerCreateServiceOrderRatingSchema>;
export type SubmitQuoteDto = z.infer<typeof SubmitQuoteSchema>;
export type CustomerConfirmQuoteDto = z.infer<typeof CustomerConfirmQuoteSchema>;
export type CustomerEstimateServiceOrderPriceDto = z.infer<typeof CustomerEstimateServiceOrderPriceSchema>;
export type CustomerCreateServiceOrderDto = z.infer<typeof CustomerCreateServiceOrderSchema>;
export type CustomerUpdateServiceOrderDto = z.infer<typeof CustomerUpdateServiceOrderSchema>;
