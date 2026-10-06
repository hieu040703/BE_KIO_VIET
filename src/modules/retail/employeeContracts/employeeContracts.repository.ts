import { injectable } from "inversify";
import { RetailEmployeeContracts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEECONTRACTS_RESOURCE } from "./employeeContracts.types";

@injectable()
export class RetailEmployeeContractsRepository extends BaseRepository<RetailEmployeeContracts> {
  protected entityClass = RetailEmployeeContracts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEECONTRACTS_RESOURCE];
  }
}
