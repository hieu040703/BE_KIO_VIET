import { injectable, inject } from "inversify";
import { RetailProductsService } from "./products.service";
import { RETAIL_PRODUCTS_TYPES } from "./products.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailProductsController extends BaseController<RetailProductsService> {
  constructor(@inject(RETAIL_PRODUCTS_TYPES.Service) protected service: RetailProductsService) {
    super(service);
  }
}
