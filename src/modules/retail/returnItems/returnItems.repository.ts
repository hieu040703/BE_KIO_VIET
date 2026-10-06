import { injectable } from "inversify";
import { RetailReturnItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { RETURNITEMS_RESOURCE } from "./returnItems.types";

@injectable()
export class RetailReturnItemsRepository extends BaseRepository<RetailReturnItems> {
  protected entityClass = RetailReturnItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[RETURNITEMS_RESOURCE];
  }
}
