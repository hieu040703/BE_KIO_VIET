import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPurchaseOrderItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailPurchaseOrderItemsRepository } from "./purchaseOrderItems.repository";
import { RETAIL_PURCHASE_ORDER_ITEMS_TYPES } from "./purchaseOrderItems.types";

@injectable()
export class RetailPurchaseOrderItemsService extends BaseService<RetailPurchaseOrderItems> {
  constructor(@inject(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Repository) repository: RetailPurchaseOrderItemsRepository) {
    super(repository);
  }
}
