import { injectable } from "inversify";
import { RetailEmployeeKpis } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEEKPIS_RESOURCE } from "./employeeKpis.types";

@injectable()
export class RetailEmployeeKpisRepository extends BaseRepository<RetailEmployeeKpis> {
  protected entityClass = RetailEmployeeKpis;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEEKPIS_RESOURCE];
  }
}
