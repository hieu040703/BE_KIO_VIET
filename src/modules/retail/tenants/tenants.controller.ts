import { injectable, inject } from "inversify";
import { RetailTenantsService } from "./tenants.service";
import { RETAIL_TENANTS_TYPES } from "./tenants.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailTenantsController extends BaseController<RetailTenantsService> {
  constructor(@inject(RETAIL_TENANTS_TYPES.Service) protected service: RetailTenantsService) {
    super(service);
  }
}
