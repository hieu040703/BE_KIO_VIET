import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockReservations } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockReservationsRepository } from "./stockReservations.repository";
import { RETAIL_STOCK_RESERVATIONS_TYPES } from "./stockReservations.types";

@injectable()
export class RetailStockReservationsService extends BaseService<RetailStockReservations> {
  constructor(@inject(RETAIL_STOCK_RESERVATIONS_TYPES.Repository) repository: RetailStockReservationsRepository) {
    super(repository);
  }
}
