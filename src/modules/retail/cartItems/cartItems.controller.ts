import { injectable, inject } from "inversify";
import { RetailCartItemsService } from "./cartItems.service";
import { RETAIL_CART_ITEMS_TYPES } from "./cartItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCartItemsController extends BaseController<RetailCartItemsService> {
  constructor(@inject(RETAIL_CART_ITEMS_TYPES.Service) protected service: RetailCartItemsService) {
    super(service);
  }
}
