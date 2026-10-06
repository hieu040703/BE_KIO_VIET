import { injectable, inject } from "inversify";
import { RetailShippingProvidersService } from "./shippingProviders.service";
import { RETAIL_SHIPPING_PROVIDERS_TYPES } from "./shippingProviders.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailShippingProvidersController extends BaseController<RetailShippingProvidersService> {
  constructor(@inject(RETAIL_SHIPPING_PROVIDERS_TYPES.Service) protected service: RetailShippingProvidersService) {
    super(service);
  }
}
