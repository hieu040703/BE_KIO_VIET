import { injectable, inject } from "inversify";
import { RetailVouchersService } from "./vouchers.service";
import { RETAIL_VOUCHERS_TYPES } from "./vouchers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailVouchersController extends BaseController<RetailVouchersService> {
  constructor(@inject(RETAIL_VOUCHERS_TYPES.Service) protected service: RetailVouchersService) {
    super(service);
  }
}
