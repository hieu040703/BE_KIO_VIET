export const RETAIL_CART_ITEMS_TYPES = {
  Repository: Symbol.for("RetailCartItemsRepository"),
  Service: Symbol.for("RetailCartItemsService"),
  Controller: Symbol.for("RetailCartItemsController"),
  Router: Symbol.for("RetailCartItemsRouter"),
} as const;

export const CARTITEMS_RESOURCE = "cart-items" as const;
