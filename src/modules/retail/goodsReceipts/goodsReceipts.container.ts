import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailGoodsReceiptsController } from "./goodsReceipts.controller";
import { RetailGoodsReceiptsRepository } from "./goodsReceipts.repository";
import { RetailGoodsReceiptsRouter } from "./goodsReceipts.route";
import { RetailGoodsReceiptsService } from "./goodsReceipts.service";
import { RETAIL_GOODS_RECEIPTS_TYPES } from "./goodsReceipts.types";

export const goodsReceiptsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailGoodsReceiptsRepository>(RETAIL_GOODS_RECEIPTS_TYPES.Repository).to(RetailGoodsReceiptsRepository);
  options.bind<RetailGoodsReceiptsService>(RETAIL_GOODS_RECEIPTS_TYPES.Service).to(RetailGoodsReceiptsService);
  options.bind<RetailGoodsReceiptsController>(RETAIL_GOODS_RECEIPTS_TYPES.Controller).to(RetailGoodsReceiptsController);
  options.bind<RetailGoodsReceiptsRouter>(RETAIL_GOODS_RECEIPTS_TYPES.Router).to(RetailGoodsReceiptsRouter);
});
