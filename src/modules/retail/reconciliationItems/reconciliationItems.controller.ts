import { injectable, inject } from "inversify";
import { RetailReconciliationItemsService } from "./reconciliationItems.service";
import { RETAIL_RECONCILIATION_ITEMS_TYPES } from "./reconciliationItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailReconciliationItemsController extends BaseController<RetailReconciliationItemsService> {
  constructor(@inject(RETAIL_RECONCILIATION_ITEMS_TYPES.Service) protected service: RetailReconciliationItemsService) {
    super(service);
  }
}
