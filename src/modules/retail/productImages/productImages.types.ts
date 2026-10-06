export const RETAIL_PRODUCT_IMAGES_TYPES = {
  Repository: Symbol.for("RetailProductImagesRepository"),
  Service: Symbol.for("RetailProductImagesService"),
  Controller: Symbol.for("RetailProductImagesController"),
  Router: Symbol.for("RetailProductImagesRouter"),
} as const;

export const PRODUCTIMAGES_RESOURCE = "product-images" as const;
