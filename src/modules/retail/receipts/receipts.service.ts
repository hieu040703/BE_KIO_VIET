import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailReceipts } from "@/database/models/retail/RetailGenericEntities";
import { RetailReceiptsRepository } from "./receipts.repository";
import { RETAIL_RECEIPTS_TYPES } from "./receipts.types";

@injectable()
export class RetailReceiptsService extends BaseService<RetailReceipts> {
  constructor(@inject(RETAIL_RECEIPTS_TYPES.Repository) repository: RetailReceiptsRepository) {
    super(repository);
  }
}
