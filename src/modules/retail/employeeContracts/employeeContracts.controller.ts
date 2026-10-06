import { injectable, inject } from "inversify";
import { RetailEmployeeContractsService } from "./employeeContracts.service";
import { RETAIL_EMPLOYEE_CONTRACTS_TYPES } from "./employeeContracts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeContractsController extends BaseController<RetailEmployeeContractsService> {
  constructor(@inject(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Service) protected service: RetailEmployeeContractsService) {
    super(service);
  }
}
