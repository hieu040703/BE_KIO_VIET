import { injectable, inject } from "inversify";
import { RetailSuppliersService } from "./suppliers.service";
import { RETAIL_SUPPLIERS_TYPES } from "./suppliers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSuppliersController extends BaseController<RetailSuppliersService> {
  constructor(@inject(RETAIL_SUPPLIERS_TYPES.Service) protected service: RetailSuppliersService) {
    super(service);
  }
}
