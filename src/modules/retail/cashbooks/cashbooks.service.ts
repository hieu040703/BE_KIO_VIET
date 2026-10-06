import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCashbooks } from "@/database/models/retail/RetailGenericEntities";
import { RetailCashbooksRepository } from "./cashbooks.repository";
import { RETAIL_CASHBOOKS_TYPES } from "./cashbooks.types";

@injectable()
export class RetailCashbooksService extends BaseService<RetailCashbooks> {
  constructor(@inject(RETAIL_CASHBOOKS_TYPES.Repository) repository: RetailCashbooksRepository) {
    super(repository);
  }
}
