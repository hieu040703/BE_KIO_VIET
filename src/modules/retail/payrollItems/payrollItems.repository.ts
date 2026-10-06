import { injectable } from "inversify";
import { RetailPayrollItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYROLLITEMS_RESOURCE } from "./payrollItems.types";

@injectable()
export class RetailPayrollItemsRepository extends BaseRepository<RetailPayrollItems> {
  protected entityClass = RetailPayrollItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYROLLITEMS_RESOURCE];
  }
}
