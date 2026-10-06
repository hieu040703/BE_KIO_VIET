import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCategories } from "@/database/models/retail/RetailGenericEntities";
import { RetailCategoriesRepository } from "./categories.repository";
import { RETAIL_CATEGORIES_TYPES } from "./categories.types";

@injectable()
export class RetailCategoriesService extends BaseService<RetailCategories> {
  constructor(@inject(RETAIL_CATEGORIES_TYPES.Repository) repository: RetailCategoriesRepository) {
    super(repository);
  }
}
