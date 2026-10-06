import { injectable, inject } from "inversify";
import { RetailStockReservationsService } from "./stockReservations.service";
import { RETAIL_STOCK_RESERVATIONS_TYPES } from "./stockReservations.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockReservationsController extends BaseController<RetailStockReservationsService> {
  constructor(@inject(RETAIL_STOCK_RESERVATIONS_TYPES.Service) protected service: RetailStockReservationsService) {
    super(service);
  }
}
