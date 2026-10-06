import { injectable, inject } from "inversify";
import { RetailExchangesService } from "./exchanges.service";
import { RETAIL_EXCHANGES_TYPES } from "./exchanges.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailExchangesController extends BaseController<RetailExchangesService> {
  constructor(@inject(RETAIL_EXCHANGES_TYPES.Service) protected service: RetailExchangesService) {
    super(service);
  }
}
