import { injectable } from "inversify";
import { RetailShippingProviders } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SHIPPINGPROVIDERS_RESOURCE } from "./shippingProviders.types";

@injectable()
export class RetailShippingProvidersRepository extends BaseRepository<RetailShippingProviders> {
  protected entityClass = RetailShippingProviders;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SHIPPINGPROVIDERS_RESOURCE];
  }
}
