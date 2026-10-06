export const RETAIL_GOODS_RECEIPTS_TYPES = {
  Repository: Symbol.for("RetailGoodsReceiptsRepository"),
  Service: Symbol.for("RetailGoodsReceiptsService"),
  Controller: Symbol.for("RetailGoodsReceiptsController"),
  Router: Symbol.for("RetailGoodsReceiptsRouter"),
} as const;

export const GOODSRECEIPTS_RESOURCE = "goods-receipts" as const;
