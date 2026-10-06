import { injectable } from "inversify";
import { RetailExpenses } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EXPENSES_RESOURCE } from "./expenses.types";

@injectable()
export class RetailExpensesRepository extends BaseRepository<RetailExpenses> {
  protected entityClass = RetailExpenses;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EXPENSES_RESOURCE];
  }
}
