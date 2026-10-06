import { injectable } from "inversify";
import { RetailStores } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { STORES_RESOURCE } from "./stores.types";

@injectable()
export class RetailStoresRepository extends BaseRepository<RetailStores> {
  protected entityClass = RetailStores;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[STORES_RESOURCE];
  }
}
