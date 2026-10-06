import { injectable, inject } from "inversify";
import { RetailBranchesService } from "./branches.service";
import { RETAIL_BRANCHES_TYPES } from "./branches.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailBranchesController extends BaseController<RetailBranchesService> {
  constructor(@inject(RETAIL_BRANCHES_TYPES.Service) protected service: RetailBranchesService) {
    super(service);
  }
}
