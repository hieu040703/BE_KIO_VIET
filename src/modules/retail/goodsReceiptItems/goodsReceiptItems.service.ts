import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailGoodsReceiptItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailGoodsReceiptItemsRepository } from "./goodsReceiptItems.repository";
import { RETAIL_GOODS_RECEIPT_ITEMS_TYPES } from "./goodsReceiptItems.types";

@injectable()
export class RetailGoodsReceiptItemsService extends BaseService<RetailGoodsReceiptItems> {
  constructor(@inject(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Repository) repository: RetailGoodsReceiptItemsRepository) {
    super(repository);
  }
}
