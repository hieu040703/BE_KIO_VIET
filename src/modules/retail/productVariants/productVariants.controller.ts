import { injectable, inject } from "inversify";
import { RetailProductVariantsService } from "./productVariants.service";
import { RETAIL_PRODUCT_VARIANTS_TYPES } from "./productVariants.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailProductVariantsController extends BaseController<RetailProductVariantsService> {
  constructor(@inject(RETAIL_PRODUCT_VARIANTS_TYPES.Service) protected service: RetailProductVariantsService) {
    super(service);
  }
}
