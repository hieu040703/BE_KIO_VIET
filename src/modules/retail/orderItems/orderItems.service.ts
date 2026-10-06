import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOrderItem } from "@/database/models";
import { RetailOrderItemsRepository } from "./orderItems.repository";
import { RETAIL_ORDER_ITEMS_TYPES } from "./orderItems.types";

@injectable()
export class RetailOrderItemsService extends BaseService<RetailOrderItem> {
  constructor(@inject(RETAIL_ORDER_ITEMS_TYPES.Repository) repository: RetailOrderItemsRepository) {
    super(repository);
  }
}
