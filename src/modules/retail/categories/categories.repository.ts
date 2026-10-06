import { injectable } from "inversify";
import { RetailCategories } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CATEGORIES_RESOURCE } from "./categories.types";

@injectable()
export class RetailCategoriesRepository extends BaseRepository<RetailCategories> {
  protected entityClass = RetailCategories;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CATEGORIES_RESOURCE];
  }
}
