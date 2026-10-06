import { Service } from "@/database/models/Service";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ServiceSelectBasic: FindOptionsSelect<Service> = {
  id: true,
  name: true,
  type: true,
  icon: true,
  autoQuote: true,
  description: true,
  note: true,
};

export const ServiceSelectFull: FindOptionsSelect<Service> = {
  ...ServiceSelectBasic,
  servicePrices: {
    id: true,
    category: true,
    unit: true,
    quantity: true,
    price: true,
    excessUnitPrice: true,
    note: true,
  },
};

export const ServiceRelations: FindOptionsRelations<Service> = {
  servicePrices: true,
};
