export const RETAIL_GOODS_RECEIPT_ITEMS_TYPES = {
  Repository: Symbol.for("RetailGoodsReceiptItemsRepository"),
  Service: Symbol.for("RetailGoodsReceiptItemsService"),
  Controller: Symbol.for("RetailGoodsReceiptItemsController"),
  Router: Symbol.for("RetailGoodsReceiptItemsRouter"),
} as const;

export const GOODSRECEIPTITEMS_RESOURCE = "goods-receipt-items" as const;
