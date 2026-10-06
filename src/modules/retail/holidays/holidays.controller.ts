import { injectable, inject } from "inversify";
import { RetailHolidaysService } from "./holidays.service";
import { RETAIL_HOLIDAYS_TYPES } from "./holidays.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailHolidaysController extends BaseController<RetailHolidaysService> {
  constructor(@inject(RETAIL_HOLIDAYS_TYPES.Service) protected service: RetailHolidaysService) {
    super(service);
  }
}
