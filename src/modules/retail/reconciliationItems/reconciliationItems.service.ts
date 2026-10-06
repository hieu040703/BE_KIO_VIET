import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailReconciliationItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailReconciliationItemsRepository } from "./reconciliationItems.repository";
import { RETAIL_RECONCILIATION_ITEMS_TYPES } from "./reconciliationItems.types";

@injectable()
export class RetailReconciliationItemsService extends BaseService<RetailReconciliationItems> {
  constructor(@inject(RETAIL_RECONCILIATION_ITEMS_TYPES.Repository) repository: RetailReconciliationItemsRepository) {
    super(repository);
  }
}
