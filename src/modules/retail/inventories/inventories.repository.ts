import { injectable } from "inversify";
import { RetailInventory } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { INVENTORIES_RESOURCE } from "./inventories.types";

@injectable()
export class RetailInventoriesRepository extends BaseRepository<RetailInventory> {
  protected entityClass = RetailInventory;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[INVENTORIES_RESOURCE];
  }
}
