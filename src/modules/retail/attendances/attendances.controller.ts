import { injectable, inject } from "inversify";
import { RetailAttendancesService } from "./attendances.service";
import { RETAIL_ATTENDANCES_TYPES } from "./attendances.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAttendancesController extends BaseController<RetailAttendancesService> {
  constructor(@inject(RETAIL_ATTENDANCES_TYPES.Service) protected service: RetailAttendancesService) {
    super(service);
  }
}
