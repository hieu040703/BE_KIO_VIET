import { injectable, inject } from "inversify";
import { RetailWebhooksService } from "./webhooks.service";
import { RETAIL_WEBHOOKS_TYPES } from "./webhooks.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailWebhooksController extends BaseController<RetailWebhooksService> {
  constructor(@inject(RETAIL_WEBHOOKS_TYPES.Service) protected service: RetailWebhooksService) {
    super(service);
  }
}
