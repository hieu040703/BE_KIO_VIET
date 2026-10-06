import { BaseRepository } from "@/shared/base/BaseRepository";
import { Transaction } from "@/database/models/Transaction";
import { FindOptionsSelect } from "typeorm";
import { TransactionSelectFull, TransactionRelations } from "./transaction.select";
import { injectable, inject } from "inversify";

@injectable()
export class TransactionRepository extends BaseRepository<Transaction> {
  protected entityClass = Transaction;
  protected selectedFields = TransactionSelectFull;
  protected relations = TransactionRelations;
  protected multipleFile: boolean = true;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Transaction> | undefined): void {
    this.selectedFields = selectedFields || TransactionSelectFull;
    this.relations = TransactionRelations;
  }
}
