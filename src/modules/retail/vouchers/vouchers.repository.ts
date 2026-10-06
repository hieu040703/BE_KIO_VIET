import { injectable } from "inversify";
import { RetailVouchers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { VOUCHERS_RESOURCE } from "./vouchers.types";

@injectable()
export class RetailVouchersRepository extends BaseRepository<RetailVouchers> {
  protected entityClass = RetailVouchers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[VOUCHERS_RESOURCE];
  }
}
