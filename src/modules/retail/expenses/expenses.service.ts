import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailExpenses } from "@/database/models/retail/RetailGenericEntities";
import { RetailExpensesRepository } from "./expenses.repository";
import { RETAIL_EXPENSES_TYPES } from "./expenses.types";

@injectable()
export class RetailExpensesService extends BaseService<RetailExpenses> {
  constructor(@inject(RETAIL_EXPENSES_TYPES.Repository) repository: RetailExpensesRepository) {
    super(repository);
  }
}
