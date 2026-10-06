import { injectable, inject } from "inversify";
import { RetailCartsService } from "./carts.service";
import { RETAIL_CARTS_TYPES } from "./carts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCartsController extends BaseController<RetailCartsService> {
  constructor(@inject(RETAIL_CARTS_TYPES.Service) protected service: RetailCartsService) {
    super(service);
  }
}
