import { injectable } from "inversify";
import { RetailTaxRates } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { TAXRATES_RESOURCE } from "./taxRates.types";

@injectable()
export class RetailTaxRatesRepository extends BaseRepository<RetailTaxRates> {
  protected entityClass = RetailTaxRates;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[TAXRATES_RESOURCE];
  }
}
