import { OrderDetail } from "@/database/models/OrderDetail";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const OrderDetailSelectBasic: FindOptionsSelect<OrderDetail> = {
  id: true,
  name: true,
  orderId: true,
  unit: true,
  quantity: true,
  price: true,
  totalHours: true,
  amount: true,
  note: true,
};

export const OrderDetailSelectFull: FindOptionsSelect<OrderDetail> = {
  ...OrderDetailSelectBasic,
};

export const OrderDetailRelations: FindOptionsRelations<OrderDetail> = {};
