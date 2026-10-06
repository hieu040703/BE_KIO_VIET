import { injectable } from "inversify";
import { RetailPromotionProducts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PROMOTIONPRODUCTS_RESOURCE } from "./promotionProducts.types";

@injectable()
export class RetailPromotionProductsRepository extends BaseRepository<RetailPromotionProducts> {
  protected entityClass = RetailPromotionProducts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PROMOTIONPRODUCTS_RESOURCE];
  }
}
