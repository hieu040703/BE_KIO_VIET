import { injectable } from "inversify";
import { RetailPromotionActions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PROMOTIONACTIONS_RESOURCE } from "./promotionActions.types";

@injectable()
export class RetailPromotionActionsRepository extends BaseRepository<RetailPromotionActions> {
  protected entityClass = RetailPromotionActions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PROMOTIONACTIONS_RESOURCE];
  }
}
