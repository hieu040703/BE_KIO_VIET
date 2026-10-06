import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailVouchers } from "@/database/models/retail/RetailGenericEntities";
import { RetailVouchersRepository } from "./vouchers.repository";
import { RETAIL_VOUCHERS_TYPES } from "./vouchers.types";

@injectable()
export class RetailVouchersService extends BaseService<RetailVouchers> {
  constructor(@inject(RETAIL_VOUCHERS_TYPES.Repository) repository: RetailVouchersRepository) {
    super(repository);
  }
}
