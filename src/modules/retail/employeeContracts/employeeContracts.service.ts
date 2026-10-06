import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeContracts } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeContractsRepository } from "./employeeContracts.repository";
import { RETAIL_EMPLOYEE_CONTRACTS_TYPES } from "./employeeContracts.types";

@injectable()
export class RetailEmployeeContractsService extends BaseService<RetailEmployeeContracts> {
  constructor(@inject(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Repository) repository: RetailEmployeeContractsRepository) {
    super(repository);
  }
}
