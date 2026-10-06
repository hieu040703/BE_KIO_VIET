import { injectable, inject } from "inversify";
import { RetailEmployeesService } from "./employees.service";
import { RETAIL_EMPLOYEES_TYPES } from "./employees.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeesController extends BaseController<RetailEmployeesService> {
  constructor(@inject(RETAIL_EMPLOYEES_TYPES.Service) protected service: RetailEmployeesService) {
    super(service);
  }
}
