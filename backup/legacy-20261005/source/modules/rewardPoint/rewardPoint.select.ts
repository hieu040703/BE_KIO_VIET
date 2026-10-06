import { RewardPoint } from "@/database/models/RewardPoint";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { OrderSelectBasic } from "../order/order.select";

export const RewardPointSelectBasic: FindOptionsSelect<RewardPoint> = {
  id: true,
  customerId: true,
  orderId: true,
  type: true,
  points: true,
  note: true,
};

export const RewardPointSelectFull: FindOptionsSelect<RewardPoint> = {
  ...RewardPointSelectBasic,
  order: {
    id: true,
    code: true,
    serviceOrderId: true,
    serviceOrder: {
      id: true,
      code: true,
    },
  },
};

export const RewardPointRelations: FindOptionsRelations<RewardPoint> = {
  order: {
    serviceOrder: true,
  },
};
