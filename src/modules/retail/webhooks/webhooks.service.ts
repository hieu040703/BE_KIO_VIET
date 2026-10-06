import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailWebhooks } from "@/database/models/retail/RetailGenericEntities";
import { RetailWebhooksRepository } from "./webhooks.repository";
import { RETAIL_WEBHOOKS_TYPES } from "./webhooks.types";

@injectable()
export class RetailWebhooksService extends BaseService<RetailWebhooks> {
  constructor(@inject(RETAIL_WEBHOOKS_TYPES.Repository) repository: RetailWebhooksRepository) {
    super(repository);
  }
}
