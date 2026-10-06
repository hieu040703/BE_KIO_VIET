import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCashMovements } from "@/database/models/retail/RetailGenericEntities";
import { RetailCashMovementsRepository } from "./cashMovements.repository";
import { RETAIL_CASH_MOVEMENTS_TYPES } from "./cashMovements.types";

@injectable()
export class RetailCashMovementsService extends BaseService<RetailCashMovements> {
  constructor(@inject(RETAIL_CASH_MOVEMENTS_TYPES.Repository) repository: RetailCashMovementsRepository) {
    super(repository);
  }
}
