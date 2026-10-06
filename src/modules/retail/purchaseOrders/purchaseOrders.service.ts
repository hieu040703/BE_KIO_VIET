import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPurchaseOrders } from "@/database/models/retail/RetailGenericEntities";
import { RetailPurchaseOrdersRepository } from "./purchaseOrders.repository";
import { RETAIL_PURCHASE_ORDERS_TYPES } from "./purchaseOrders.types";

@injectable()
export class RetailPurchaseOrdersService extends BaseService<RetailPurchaseOrders> {
  constructor(@inject(RETAIL_PURCHASE_ORDERS_TYPES.Repository) repository: RetailPurchaseOrdersRepository) {
    super(repository);
  }
}
