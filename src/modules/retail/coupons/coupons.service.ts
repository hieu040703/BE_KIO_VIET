import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCoupons } from "@/database/models/retail/RetailGenericEntities";
import { RetailCouponsRepository } from "./coupons.repository";
import { RETAIL_COUPONS_TYPES } from "./coupons.types";

@injectable()
export class RetailCouponsService extends BaseService<RetailCoupons> {
  constructor(@inject(RETAIL_COUPONS_TYPES.Repository) repository: RetailCouponsRepository) {
    super(repository);
  }
}
