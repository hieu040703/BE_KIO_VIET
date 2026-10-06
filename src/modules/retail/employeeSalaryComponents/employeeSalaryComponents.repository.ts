import { injectable } from "inversify";
import { RetailEmployeeSalaryComponents } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEESALARYCOMPONENTS_RESOURCE } from "./employeeSalaryComponents.types";

@injectable()
export class RetailEmployeeSalaryComponentsRepository extends BaseRepository<RetailEmployeeSalaryComponents> {
  protected entityClass = RetailEmployeeSalaryComponents;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEESALARYCOMPONENTS_RESOURCE];
  }
}
