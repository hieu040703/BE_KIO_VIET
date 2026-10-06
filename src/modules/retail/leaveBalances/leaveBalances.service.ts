import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailLeaveBalances } from "@/database/models/retail/RetailGenericEntities";
import { RetailLeaveBalancesRepository } from "./leaveBalances.repository";
import { RETAIL_LEAVE_BALANCES_TYPES } from "./leaveBalances.types";

@injectable()
export class RetailLeaveBalancesService extends BaseService<RetailLeaveBalances> {
  constructor(@inject(RETAIL_LEAVE_BALANCES_TYPES.Repository) repository: RetailLeaveBalancesRepository) {
    super(repository);
  }
}
