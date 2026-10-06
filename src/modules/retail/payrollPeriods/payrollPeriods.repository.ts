import { injectable } from "inversify";
import { RetailPayrollPeriods } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYROLLPERIODS_RESOURCE } from "./payrollPeriods.types";

@injectable()
export class RetailPayrollPeriodsRepository extends BaseRepository<RetailPayrollPeriods> {
  protected entityClass = RetailPayrollPeriods;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYROLLPERIODS_RESOURCE];
  }
}
