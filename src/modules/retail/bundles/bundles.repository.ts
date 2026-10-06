import { injectable } from "inversify";
import { RetailBundles } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { BUNDLES_RESOURCE } from "./bundles.types";

@injectable()
export class RetailBundlesRepository extends BaseRepository<RetailBundles> {
  protected entityClass = RetailBundles;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[BUNDLES_RESOURCE];
  }
}
