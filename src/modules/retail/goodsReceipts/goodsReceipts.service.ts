import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailGoodsReceipts } from "@/database/models/retail/RetailGenericEntities";
import { RetailGoodsReceiptsRepository } from "./goodsReceipts.repository";
import { RETAIL_GOODS_RECEIPTS_TYPES } from "./goodsReceipts.types";

@injectable()
export class RetailGoodsReceiptsService extends BaseService<RetailGoodsReceipts> {
  constructor(@inject(RETAIL_GOODS_RECEIPTS_TYPES.Repository) repository: RetailGoodsReceiptsRepository) {
    super(repository);
  }
}
