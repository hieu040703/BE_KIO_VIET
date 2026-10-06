import { ServiceOrderRating } from "@/database/models/OrderRating";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ServiceOrderRatingSelectBasic: FindOptionsSelect<ServiceOrderRating> = {
  id: true,
  orderId: true,
  employeeId: true,
  rating: true,
  review: true,
  note: true,
};

export const ServiceOrderRatingSelectFull: FindOptionsSelect<ServiceOrderRating> = {
  ...ServiceOrderRatingSelectBasic,
};

export const ServiceOrderRatingRelations: FindOptionsRelations<ServiceOrderRating> = {};
