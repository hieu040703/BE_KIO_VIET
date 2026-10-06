import { ZaloMessageHistory } from "@/database/models/ZaloMessageHistory";
import { CustomerSelectBasic } from "@/modules/customer/customer.select";
import { OrderSelectBasic } from "@/modules/order/order.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ZaloMessageHistorySelectBasic: FindOptionsSelect<ZaloMessageHistory> = {
  id: true,
  orderId: true,
  customerId: true,
  templateId: true,
  templateName: true,
  templateType: true,
  phone: true,
  msgId: true,
  status: true,
  errorCode: true,
  errorMessage: true,
  templateData: true,
  requestPayload: true,
  sentAt: true,
  createdAt: true,
};

export const ZaloMessageHistorySelectFull: FindOptionsSelect<ZaloMessageHistory> = {
  ...ZaloMessageHistorySelectBasic,
  order: OrderSelectBasic,
  customer: CustomerSelectBasic,
};

export const ZaloMessageHistoryRelations: FindOptionsRelations<ZaloMessageHistory> = {
  customer: true,
  order: true,
};
