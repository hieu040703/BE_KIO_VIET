import { injectable, inject } from "inversify";
import { RetailEmployeePositionHistoryService } from "./employeePositionHistory.service";
import { RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES } from "./employeePositionHistory.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeePositionHistoryController extends BaseController<RetailEmployeePositionHistoryService> {
  constructor(@inject(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Service) protected service: RetailEmployeePositionHistoryService) {
    super(service);
  }
}
