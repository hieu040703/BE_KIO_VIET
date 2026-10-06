import { injectable } from "inversify";
import { RetailInventoryCostLayers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { INVENTORYCOSTLAYERS_RESOURCE } from "./inventoryCostLayers.types";

@injectable()
export class RetailInventoryCostLayersRepository extends BaseRepository<RetailInventoryCostLayers> {
  protected entityClass = RetailInventoryCostLayers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[INVENTORYCOSTLAYERS_RESOURCE];
  }
}
