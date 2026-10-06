import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPurchaseReturns } from "@/database/models/retail/RetailGenericEntities";
import { RetailPurchaseReturnsRepository } from "./purchaseReturns.repository";
import { RETAIL_PURCHASE_RETURNS_TYPES } from "./purchaseReturns.types";

@injectable()
export class RetailPurchaseReturnsService extends BaseService<RetailPurchaseReturns> {
  constructor(@inject(RETAIL_PURCHASE_RETURNS_TYPES.Repository) repository: RetailPurchaseReturnsRepository) {
    super(repository);
  }
}
