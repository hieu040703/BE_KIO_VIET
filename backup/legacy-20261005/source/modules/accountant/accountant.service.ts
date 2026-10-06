import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { Finance } from "@/database/models/Finance";
import { FinanceRelations, FinanceSelectFull } from "./finance/finance.select";
import { FINANCE_TYPES } from "./finance/finance.types";
import { FinanceRepository } from "./finance/finance.repository";

@injectable()
export class AccountantService extends BaseService<Finance> {
  protected relations = FinanceRelations;
  protected selectedFields = FinanceSelectFull;
  constructor(@inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository) {
    super(financeRepository);
  }
}
