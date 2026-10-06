import { injectable } from "inversify";
import { RetailCouponUsages } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { COUPONUSAGES_RESOURCE } from "./couponUsages.types";

@injectable()
export class RetailCouponUsagesRepository extends BaseRepository<RetailCouponUsages> {
  protected entityClass = RetailCouponUsages;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[COUPONUSAGES_RESOURCE];
  }
}
