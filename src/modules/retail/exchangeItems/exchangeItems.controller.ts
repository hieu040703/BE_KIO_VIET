import { injectable, inject } from "inversify";
import { RetailExchangeItemsService } from "./exchangeItems.service";
import { RETAIL_EXCHANGE_ITEMS_TYPES } from "./exchangeItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailExchangeItemsController extends BaseController<RetailExchangeItemsService> {
  constructor(@inject(RETAIL_EXCHANGE_ITEMS_TYPES.Service) protected service: RetailExchangeItemsService) {
    super(service);
  }
}
