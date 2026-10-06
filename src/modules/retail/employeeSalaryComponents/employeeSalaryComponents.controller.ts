import { injectable, inject } from "inversify";
import { RetailEmployeeSalaryComponentsService } from "./employeeSalaryComponents.service";
import { RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES } from "./employeeSalaryComponents.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeSalaryComponentsController extends BaseController<RetailEmployeeSalaryComponentsService> {
  constructor(@inject(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Service) protected service: RetailEmployeeSalaryComponentsService) {
    super(service);
  }
}
