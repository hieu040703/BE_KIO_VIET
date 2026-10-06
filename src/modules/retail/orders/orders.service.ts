import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOrder } from "@/database/models";
import { RetailOrdersRepository } from "./orders.repository";
import { RETAIL_ORDERS_TYPES } from "./orders.types";

@injectable()
export class RetailOrdersService extends BaseService<RetailOrder> {
  constructor(@inject(RETAIL_ORDERS_TYPES.Repository) repository: RetailOrdersRepository) {
    super(repository);
  }
}
