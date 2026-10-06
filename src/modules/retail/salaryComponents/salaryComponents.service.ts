import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSalaryComponents } from "@/database/models/retail/RetailGenericEntities";
import { RetailSalaryComponentsRepository } from "./salaryComponents.repository";
import { RETAIL_SALARY_COMPONENTS_TYPES } from "./salaryComponents.types";

@injectable()
export class RetailSalaryComponentsService extends BaseService<RetailSalaryComponents> {
  constructor(@inject(RETAIL_SALARY_COMPONENTS_TYPES.Repository) repository: RetailSalaryComponentsRepository) {
    super(repository);
  }
}
