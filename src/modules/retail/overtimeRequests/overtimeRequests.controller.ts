import { injectable, inject } from "inversify";
import { RetailOvertimeRequestsService } from "./overtimeRequests.service";
import { RETAIL_OVERTIME_REQUESTS_TYPES } from "./overtimeRequests.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOvertimeRequestsController extends BaseController<RetailOvertimeRequestsService> {
  constructor(@inject(RETAIL_OVERTIME_REQUESTS_TYPES.Service) protected service: RetailOvertimeRequestsService) {
    super(service);
  }
}
