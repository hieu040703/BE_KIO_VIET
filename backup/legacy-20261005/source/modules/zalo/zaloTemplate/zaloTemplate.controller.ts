import { BaseController } from "@/shared/base/BaseController";
import { injectable, inject } from "inversify";
import { ZaloTemplateService } from "./zaloTemplate.service";
import { ZALO_TEMPLATE_TYPES } from "./zaloTemplate.types";

@injectable()
export class ZaloTemplateController extends BaseController<ZaloTemplateService> {
  constructor(
    @inject(ZALO_TEMPLATE_TYPES.ZaloTemplateService)
    protected service: ZaloTemplateService,
  ) {
    super(service);
  }
}
