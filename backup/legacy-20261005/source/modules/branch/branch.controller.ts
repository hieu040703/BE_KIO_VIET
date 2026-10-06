import { injectable, inject } from "inversify";
    import { BranchService } from "./branch.service";
    import { BRANCH_TYPES } from "./branch.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class BranchController extends BaseController<BranchService> {
      constructor(@inject(BRANCH_TYPES.BranchService) protected service: BranchService) {
        super(service);
      }
    }
    