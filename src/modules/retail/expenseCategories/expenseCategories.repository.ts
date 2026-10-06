import { injectable } from "inversify";
import { RetailExpenseCategories } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EXPENSECATEGORIES_RESOURCE } from "./expenseCategories.types";

@injectable()
export class RetailExpenseCategoriesRepository extends BaseRepository<RetailExpenseCategories> {
  protected entityClass = RetailExpenseCategories;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EXPENSECATEGORIES_RESOURCE];
  }
}
