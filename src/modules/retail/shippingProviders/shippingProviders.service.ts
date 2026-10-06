import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailShippingProviders } from "@/database/models/retail/RetailGenericEntities";
import { RetailShippingProvidersRepository } from "./shippingProviders.repository";
import { RETAIL_SHIPPING_PROVIDERS_TYPES } from "./shippingProviders.types";

@injectable()
export class RetailShippingProvidersService extends BaseService<RetailShippingProviders> {
  constructor(@inject(RETAIL_SHIPPING_PROVIDERS_TYPES.Repository) repository: RetailShippingProvidersRepository) {
    super(repository);
  }
}
