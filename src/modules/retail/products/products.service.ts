import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailProduct } from "@/database/models";
import { RetailProductsRepository } from "./products.repository";
import { RETAIL_PRODUCTS_TYPES } from "./products.types";

@injectable()
export class RetailProductsService extends BaseService<RetailProduct> {
  constructor(@inject(RETAIL_PRODUCTS_TYPES.Repository) repository: RetailProductsRepository) {
    super(repository);
  }
}
