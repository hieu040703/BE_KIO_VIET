import { ServicePrice } from "@/database/models/ServicePrice";
    import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ServicePriceSelectBasic: FindOptionsSelect<ServicePrice> = {
  id: true,
  serviceId: true,
  category: true,
  unit: true,
  quantity: true,
  price: true,
  excessUnitPrice: true,
  note: true,
};

export const ServicePriceSelectFull: FindOptionsSelect<ServicePrice> = {
  ...ServicePriceSelectBasic,
};

export const ServicePriceRelations: FindOptionsRelations<ServicePrice> = {};
