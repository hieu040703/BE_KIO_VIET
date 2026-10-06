import { BaseController } from "@/shared/base/BaseController";
import { inject, injectable } from "inversify";
import { AdminVouchersTemplateService } from "./admin.vouchersTemplate.service";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";

@injectable()
export class AdminVouchersTemplateController extends BaseController<AdminVouchersTemplateService> {
  constructor(
    @inject(VOUCHERS_TEMPLATE_TYPES.AdminVouchersTemplateService)
    protected service: AdminVouchersTemplateService,
  ) {
    super(service);
  }
}
