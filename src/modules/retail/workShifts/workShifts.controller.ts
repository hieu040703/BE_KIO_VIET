import { injectable, inject } from "inversify";
import { RetailWorkShiftsService } from "./workShifts.service";
import { RETAIL_WORK_SHIFTS_TYPES } from "./workShifts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailWorkShiftsController extends BaseController<RetailWorkShiftsService> {
  constructor(@inject(RETAIL_WORK_SHIFTS_TYPES.Service) protected service: RetailWorkShiftsService) {
    super(service);
  }
}
