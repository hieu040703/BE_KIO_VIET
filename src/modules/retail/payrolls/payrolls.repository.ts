import { injectable } from "inversify";
import { RetailPayroll } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYROLLS_RESOURCE } from "./payrolls.types";

@injectable()
export class RetailPayrollsRepository extends BaseRepository<RetailPayroll> {
  protected entityClass = RetailPayroll;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYROLLS_RESOURCE];
  }
}
