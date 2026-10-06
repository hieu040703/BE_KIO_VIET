import { BaseRepository } from "@/shared/base/BaseRepository";
import { Branch } from "@/database/models/Branch";
import { BranchSelectFull, BranchRelations } from "./branch.select";
import { injectable, inject } from "inversify";

@injectable()
export class BranchRepository extends BaseRepository<Branch> {
  protected entityClass = Branch;
  protected selectedFields = BranchSelectFull;
  protected relations = BranchRelations;

  constructor() {
    super();
    this.setOptions(this.selectedFields, this.relations);
  }
}
