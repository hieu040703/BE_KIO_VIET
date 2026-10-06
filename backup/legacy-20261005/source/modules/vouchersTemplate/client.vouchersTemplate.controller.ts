import { BaseController } from "@/shared/base/BaseController";
import { inject, injectable } from "inversify";
import { ClientVouchersTemplateService } from "./client.vouchersTemplate.service";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";

@injectable()
export class ClientVouchersTemplateController extends BaseController<ClientVouchersTemplateService> {
  constructor(
    @inject(VOUCHERS_TEMPLATE_TYPES.ClientVouchersTemplateService)
    protected service: ClientVouchersTemplateService,
  ) {
    super(service);
  }
}
