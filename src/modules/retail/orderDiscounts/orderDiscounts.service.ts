import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOrderDiscounts } from "@/database/models/retail/RetailGenericEntities";
import { RetailOrderDiscountsRepository } from "./orderDiscounts.repository";
import { RETAIL_ORDER_DISCOUNTS_TYPES } from "./orderDiscounts.types";

@injectable()
export class RetailOrderDiscountsService extends BaseService<RetailOrderDiscounts> {
  constructor(@inject(RETAIL_ORDER_DISCOUNTS_TYPES.Repository) repository: RetailOrderDiscountsRepository) {
    super(repository);
  }
}
