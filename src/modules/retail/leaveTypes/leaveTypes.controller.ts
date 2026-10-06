import { injectable, inject } from "inversify";
import { RetailLeaveTypesService } from "./leaveTypes.service";
import { RETAIL_LEAVE_TYPES_TYPES } from "./leaveTypes.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailLeaveTypesController extends BaseController<RetailLeaveTypesService> {
  constructor(@inject(RETAIL_LEAVE_TYPES_TYPES.Service) protected service: RetailLeaveTypesService) {
    super(service);
  }
}
