import { injectable, inject } from "inversify";
import { RetailGoodsReceiptsService } from "./goodsReceipts.service";
import { RETAIL_GOODS_RECEIPTS_TYPES } from "./goodsReceipts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailGoodsReceiptsController extends BaseController<RetailGoodsReceiptsService> {
  constructor(@inject(RETAIL_GOODS_RECEIPTS_TYPES.Service) protected service: RetailGoodsReceiptsService) {
    super(service);
  }
}
