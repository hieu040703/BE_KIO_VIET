import { injectable, inject } from "inversify";
import { RetailCashMovementsService } from "./cashMovements.service";
import { RETAIL_CASH_MOVEMENTS_TYPES } from "./cashMovements.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCashMovementsController extends BaseController<RetailCashMovementsService> {
  constructor(@inject(RETAIL_CASH_MOVEMENTS_TYPES.Service) protected service: RetailCashMovementsService) {
    super(service);
  }
}
