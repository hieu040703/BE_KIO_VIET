import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeePositionHistory } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeePositionHistoryRepository } from "./employeePositionHistory.repository";
import { RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES } from "./employeePositionHistory.types";

@injectable()
export class RetailEmployeePositionHistoryService extends BaseService<RetailEmployeePositionHistory> {
  constructor(@inject(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Repository) repository: RetailEmployeePositionHistoryRepository) {
    super(repository);
  }
}
