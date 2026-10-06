import { injectable } from "inversify";
import { RetailBundleItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { BUNDLEITEMS_RESOURCE } from "./bundleItems.types";

@injectable()
export class RetailBundleItemsRepository extends BaseRepository<RetailBundleItems> {
  protected entityClass = RetailBundleItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[BUNDLEITEMS_RESOURCE];
  }
}
