import { injectable } from "inversify";
import { RetailCoupons } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { COUPONS_RESOURCE } from "./coupons.types";

@injectable()
export class RetailCouponsRepository extends BaseRepository<RetailCoupons> {
  protected entityClass = RetailCoupons;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[COUPONS_RESOURCE];
  }
}
