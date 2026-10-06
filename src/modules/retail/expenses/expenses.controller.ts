import { injectable, inject } from "inversify";
import { RetailExpensesService } from "./expenses.service";
import { RETAIL_EXPENSES_TYPES } from "./expenses.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailExpensesController extends BaseController<RetailExpensesService> {
  constructor(@inject(RETAIL_EXPENSES_TYPES.Service) protected service: RetailExpensesService) {
    super(service);
  }
}
