import { injectable, inject } from "inversify";
import { RetailExpenseCategoriesService } from "./expenseCategories.service";
import { RETAIL_EXPENSE_CATEGORIES_TYPES } from "./expenseCategories.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailExpenseCategoriesController extends BaseController<RetailExpenseCategoriesService> {
  constructor(@inject(RETAIL_EXPENSE_CATEGORIES_TYPES.Service) protected service: RetailExpenseCategoriesService) {
    super(service);
  }
}
