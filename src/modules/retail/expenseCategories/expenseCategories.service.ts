import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailExpenseCategories } from "@/database/models/retail/RetailGenericEntities";
import { RetailExpenseCategoriesRepository } from "./expenseCategories.repository";
import { RETAIL_EXPENSE_CATEGORIES_TYPES } from "./expenseCategories.types";

@injectable()
export class RetailExpenseCategoriesService extends BaseService<RetailExpenseCategories> {
  constructor(@inject(RETAIL_EXPENSE_CATEGORIES_TYPES.Repository) repository: RetailExpenseCategoriesRepository) {
    super(repository);
  }
}
