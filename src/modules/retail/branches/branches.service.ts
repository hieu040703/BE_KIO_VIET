import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailBranch } from "@/database/models";
import { RetailBranchesRepository } from "./branches.repository";
import { RETAIL_BRANCHES_TYPES } from "./branches.types";

@injectable()
export class RetailBranchesService extends BaseService<RetailBranch> {
  constructor(@inject(RETAIL_BRANCHES_TYPES.Repository) repository: RetailBranchesRepository) {
    super(repository);
  }
}
