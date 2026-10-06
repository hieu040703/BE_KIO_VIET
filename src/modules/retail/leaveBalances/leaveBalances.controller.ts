import { injectable, inject } from "inversify";
import { RetailLeaveBalancesService } from "./leaveBalances.service";
import { RETAIL_LEAVE_BALANCES_TYPES } from "./leaveBalances.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailLeaveBalancesController extends BaseController<RetailLeaveBalancesService> {
  constructor(@inject(RETAIL_LEAVE_BALANCES_TYPES.Service) protected service: RetailLeaveBalancesService) {
    super(service);
  }
}
