import { injectable, inject } from "inversify";
import { RetailGoodsReceiptItemsService } from "./goodsReceiptItems.service";
import { RETAIL_GOODS_RECEIPT_ITEMS_TYPES } from "./goodsReceiptItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailGoodsReceiptItemsController extends BaseController<RetailGoodsReceiptItemsService> {
  constructor(@inject(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Service) protected service: RetailGoodsReceiptItemsService) {
    super(service);
  }
}
