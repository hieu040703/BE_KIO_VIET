import { BaseRepository } from "@/shared/base/BaseRepository";
import { FindOptionsSelect } from "typeorm";
import { ExpenseApprovalSelectFull, ExpenseApprovalRelations } from "./expenseApproval.select";
import { injectable, inject } from "inversify";
import { ExpenseApproval } from "@/database/models/ExpenseApproval";

@injectable()
export class ExpenseApprovalRepository extends BaseRepository<ExpenseApproval> {
  protected entityClass = ExpenseApproval;
  protected selectedFields = ExpenseApprovalSelectFull;
  protected relations = ExpenseApprovalRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<ExpenseApproval> | undefined): void {
    this.selectedFields = selectedFields || ExpenseApprovalSelectFull;
    this.relations = ExpenseApprovalRelations;
  }
}
