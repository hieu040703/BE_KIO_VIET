import { injectable } from "inversify";
import { RetailProductTaxRates } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRODUCTTAXRATES_RESOURCE } from "./productTaxRates.types";

@injectable()
export class RetailProductTaxRatesRepository extends BaseRepository<RetailProductTaxRates> {
  protected entityClass = RetailProductTaxRates;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRODUCTTAXRATES_RESOURCE];
  }
}
