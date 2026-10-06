import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailProductVariant } from "@/database/models";
import { RetailProductVariantsRepository } from "./productVariants.repository";
import { RETAIL_PRODUCT_VARIANTS_TYPES } from "./productVariants.types";

@injectable()
export class RetailProductVariantsService extends BaseService<RetailProductVariant> {
  constructor(@inject(RETAIL_PRODUCT_VARIANTS_TYPES.Repository) repository: RetailProductVariantsRepository) {
    super(repository);
  }
}
