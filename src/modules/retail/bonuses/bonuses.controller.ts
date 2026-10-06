import { injectable, inject } from "inversify";
import { RetailBonusesService } from "./bonuses.service";
import { RETAIL_BONUSES_TYPES } from "./bonuses.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailBonusesController extends BaseController<RetailBonusesService> {
  constructor(@inject(RETAIL_BONUSES_TYPES.Service) protected service: RetailBonusesService) {
    super(service);
  }
}
