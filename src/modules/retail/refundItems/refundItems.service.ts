import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailRefundItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailRefundItemsRepository } from "./refundItems.repository";
import { RETAIL_REFUND_ITEMS_TYPES } from "./refundItems.types";

@injectable()
export class RetailRefundItemsService extends BaseService<RetailRefundItems> {
  constructor(@inject(RETAIL_REFUND_ITEMS_TYPES.Repository) repository: RetailRefundItemsRepository) {
    super(repository);
  }
}
