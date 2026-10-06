import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOrderStatusHistory } from "@/database/models/retail/RetailGenericEntities";
import { RetailOrderStatusHistoryRepository } from "./orderStatusHistory.repository";
import { RETAIL_ORDER_STATUS_HISTORY_TYPES } from "./orderStatusHistory.types";

@injectable()
export class RetailOrderStatusHistoryService extends BaseService<RetailOrderStatusHistory> {
  constructor(@inject(RETAIL_ORDER_STATUS_HISTORY_TYPES.Repository) repository: RetailOrderStatusHistoryRepository) {
    super(repository);
  }
}
