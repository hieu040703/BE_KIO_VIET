import { injectable, inject } from "inversify";
import { RetailPositionsService } from "./positions.service";
import { RETAIL_POSITIONS_TYPES } from "./positions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPositionsController extends BaseController<RetailPositionsService> {
  constructor(@inject(RETAIL_POSITIONS_TYPES.Service) protected service: RetailPositionsService) {
    super(service);
  }
}
