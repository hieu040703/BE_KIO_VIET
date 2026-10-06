import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailBrands } from "@/database/models/retail/RetailGenericEntities";
import { RetailBrandsRepository } from "./brands.repository";
import { RETAIL_BRANDS_TYPES } from "./brands.types";

@injectable()
export class RetailBrandsService extends BaseService<RetailBrands> {
  constructor(@inject(RETAIL_BRANDS_TYPES.Repository) repository: RetailBrandsRepository) {
    super(repository);
  }
}
