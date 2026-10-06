import { injectable } from "inversify";
import { RetailBranch } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { BRANCHES_RESOURCE } from "./branches.types";

@injectable()
export class RetailBranchesRepository extends BaseRepository<RetailBranch> {
  protected entityClass = RetailBranch;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[BRANCHES_RESOURCE];
  }
}
