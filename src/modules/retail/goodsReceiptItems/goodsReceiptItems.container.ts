import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailGoodsReceiptItemsController } from "./goodsReceiptItems.controller";
import { RetailGoodsReceiptItemsRepository } from "./goodsReceiptItems.repository";
import { RetailGoodsReceiptItemsRouter } from "./goodsReceiptItems.route";
import { RetailGoodsReceiptItemsService } from "./goodsReceiptItems.service";
import { RETAIL_GOODS_RECEIPT_ITEMS_TYPES } from "./goodsReceiptItems.types";

export const goodsReceiptItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailGoodsReceiptItemsRepository>(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Repository).to(RetailGoodsReceiptItemsRepository);
  options.bind<RetailGoodsReceiptItemsService>(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Service).to(RetailGoodsReceiptItemsService);
  options.bind<RetailGoodsReceiptItemsController>(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Controller).to(RetailGoodsReceiptItemsController);
  options.bind<RetailGoodsReceiptItemsRouter>(RETAIL_GOODS_RECEIPT_ITEMS_TYPES.Router).to(RetailGoodsReceiptItemsRouter);
});
