import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailProductImages } from "@/database/models/retail/RetailGenericEntities";
import { RetailProductImagesRepository } from "./productImages.repository";
import { RETAIL_PRODUCT_IMAGES_TYPES } from "./productImages.types";

@injectable()
export class RetailProductImagesService extends BaseService<RetailProductImages> {
  constructor(@inject(RETAIL_PRODUCT_IMAGES_TYPES.Repository) repository: RetailProductImagesRepository) {
    super(repository);
  }
}
