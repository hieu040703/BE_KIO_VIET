import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCartItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailCartItemsRepository } from "./cartItems.repository";
import { RETAIL_CART_ITEMS_TYPES } from "./cartItems.types";

@injectable()
export class RetailCartItemsService extends BaseService<RetailCartItems> {
  constructor(@inject(RETAIL_CART_ITEMS_TYPES.Repository) repository: RetailCartItemsRepository) {
    super(repository);
  }
}
