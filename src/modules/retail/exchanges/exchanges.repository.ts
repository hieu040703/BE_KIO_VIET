import { injectable } from "inversify";
import { RetailExchanges } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EXCHANGES_RESOURCE } from "./exchanges.types";

@injectable()
export class RetailExchangesRepository extends BaseRepository<RetailExchanges> {
  protected entityClass = RetailExchanges;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EXCHANGES_RESOURCE];
  }
}
