import { BaseRepository } from "@/shared/base/BaseRepository";
import { FundTransaction } from "@/database/models/FundTransaction";
import { FindOptionsSelect } from "typeorm";
import { FundTransactionSelectFull, FundTransactionRelations } from "./fundTransaction.select";
import { injectable, inject } from "inversify";

@injectable()
export class FundTransactionRepository extends BaseRepository<FundTransaction> {
  protected entityClass = FundTransaction;
  protected selectedFields = FundTransactionSelectFull;
  protected relations = FundTransactionRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<FundTransaction> | undefined): void {
    this.selectedFields = selectedFields || FundTransactionSelectFull;
    this.relations = FundTransactionRelations;
  }
}
