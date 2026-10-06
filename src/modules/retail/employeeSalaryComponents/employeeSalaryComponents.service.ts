import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeSalaryComponents } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeSalaryComponentsRepository } from "./employeeSalaryComponents.repository";
import { RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES } from "./employeeSalaryComponents.types";

@injectable()
export class RetailEmployeeSalaryComponentsService extends BaseService<RetailEmployeeSalaryComponents> {
  constructor(@inject(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Repository) repository: RetailEmployeeSalaryComponentsRepository) {
    super(repository);
  }
}
