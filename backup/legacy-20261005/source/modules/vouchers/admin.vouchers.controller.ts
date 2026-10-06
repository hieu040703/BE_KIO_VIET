import { BaseController } from "@/shared/base/BaseController";
import { inject, injectable } from "inversify";
import { AdminVouchersService } from "./admin.vouchers.service";
import { VOUCHERS_TYPES } from "./vouchers.types";

@injectable()
export class AdminVouchersController extends BaseController<AdminVouchersService> {
  constructor(
    @inject(VOUCHERS_TYPES.AdminVouchersService)
    protected service: AdminVouchersService,
  ) {
    super(service);
  }
}
