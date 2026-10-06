import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployee } from "@/database/models";
import { RetailEmployeesRepository } from "./employees.repository";
import { RETAIL_EMPLOYEES_TYPES } from "./employees.types";

@injectable()
export class RetailEmployeesService extends BaseService<RetailEmployee> {
  constructor(@inject(RETAIL_EMPLOYEES_TYPES.Repository) repository: RetailEmployeesRepository) {
    super(repository);
  }
}
