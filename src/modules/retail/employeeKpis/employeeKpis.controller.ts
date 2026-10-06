import { injectable, inject } from "inversify";
import { RetailEmployeeKpisService } from "./employeeKpis.service";
import { RETAIL_EMPLOYEE_KPIS_TYPES } from "./employeeKpis.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeKpisController extends BaseController<RetailEmployeeKpisService> {
  constructor(@inject(RETAIL_EMPLOYEE_KPIS_TYPES.Service) protected service: RetailEmployeeKpisService) {
    super(service);
  }
}
