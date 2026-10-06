import { injectable, inject } from "inversify";
import { RetailProductImagesService } from "./productImages.service";
import { RETAIL_PRODUCT_IMAGES_TYPES } from "./productImages.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailProductImagesController extends BaseController<RetailProductImagesService> {
  constructor(@inject(RETAIL_PRODUCT_IMAGES_TYPES.Service) protected service: RetailProductImagesService) {
    super(service);
  }
}
