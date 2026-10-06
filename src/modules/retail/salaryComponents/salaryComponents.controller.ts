import { injectable, inject } from "inversify";
import { RetailSalaryComponentsService } from "./salaryComponents.service";
import { RETAIL_SALARY_COMPONENTS_TYPES } from "./salaryComponents.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSalaryComponentsController extends BaseController<RetailSalaryComponentsService> {
  constructor(@inject(RETAIL_SALARY_COMPONENTS_TYPES.Service) protected service: RetailSalaryComponentsService) {
    super(service);
  }
}
