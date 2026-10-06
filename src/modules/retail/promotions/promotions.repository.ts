import { injectable } from "inversify";
import { RetailPromotions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PROMOTIONS_RESOURCE } from "./promotions.types";

@injectable()
export class RetailPromotionsRepository extends BaseRepository<RetailPromotions> {
  protected entityClass = RetailPromotions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PROMOTIONS_RESOURCE];
  }
}
