import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPurchaseReturnItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailPurchaseReturnItemsRepository } from "./purchaseReturnItems.repository";
import { RETAIL_PURCHASE_RETURN_ITEMS_TYPES } from "./purchaseReturnItems.types";

@injectable()
export class RetailPurchaseReturnItemsService extends BaseService<RetailPurchaseReturnItems> {
  constructor(@inject(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Repository) repository: RetailPurchaseReturnItemsRepository) {
    super(repository);
  }
}
