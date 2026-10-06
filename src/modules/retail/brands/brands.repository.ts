import { injectable } from "inversify";
import { RetailBrands } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { BRANDS_RESOURCE } from "./brands.types";

@injectable()
export class RetailBrandsRepository extends BaseRepository<RetailBrands> {
  protected entityClass = RetailBrands;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[BRANDS_RESOURCE];
  }
}
