import { injectable } from "inversify";
import { RetailProduct } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRODUCTS_RESOURCE } from "./products.types";

@injectable()
export class RetailProductsRepository extends BaseRepository<RetailProduct> {
  protected entityClass = RetailProduct;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRODUCTS_RESOURCE];
  }
}
