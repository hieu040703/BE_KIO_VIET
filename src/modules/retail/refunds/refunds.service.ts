import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailRefunds } from "@/database/models/retail/RetailGenericEntities";
import { RetailRefundsRepository } from "./refunds.repository";
import { RETAIL_REFUNDS_TYPES } from "./refunds.types";

@injectable()
export class RetailRefundsService extends BaseService<RetailRefunds> {
  constructor(@inject(RETAIL_REFUNDS_TYPES.Repository) repository: RetailRefundsRepository) {
    super(repository);
  }
}
