import { injectable, inject } from "inversify";
import { RetailLeaveRequestsService } from "./leaveRequests.service";
import { RETAIL_LEAVE_REQUESTS_TYPES } from "./leaveRequests.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailLeaveRequestsController extends BaseController<RetailLeaveRequestsService> {
  constructor(@inject(RETAIL_LEAVE_REQUESTS_TYPES.Service) protected service: RetailLeaveRequestsService) {
    super(service);
  }
}
