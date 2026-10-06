import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailShippingOrders } from "@/database/models/retail/RetailGenericEntities";
import { RetailShippingOrdersRepository } from "./shippingOrders.repository";
import { RETAIL_SHIPPING_ORDERS_TYPES } from "./shippingOrders.types";

@injectable()
export class RetailShippingOrdersService extends BaseService<RetailShippingOrders> {
  constructor(@inject(RETAIL_SHIPPING_ORDERS_TYPES.Repository) repository: RetailShippingOrdersRepository) {
    super(repository);
  }
}
