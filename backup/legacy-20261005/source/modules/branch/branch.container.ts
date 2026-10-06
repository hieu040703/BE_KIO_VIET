
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {BranchController} from "./branch.controller";
    import {BranchService} from "./branch.service";
    import {BranchRepository} from "./branch.repository";
    import {BranchRouter} from "./branch.route";
    import {BRANCH_TYPES } from "./branch.types";



    const branchModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<BranchService>(BRANCH_TYPES.BranchService).to(BranchService);
      options.bind<BranchController>(BRANCH_TYPES.BranchController).to(BranchController);
      options.bind<BranchRepository>(BRANCH_TYPES.BranchRepository).to(BranchRepository);
      options.bind<BranchRouter>(BRANCH_TYPES.BranchRouter).to(BranchRouter);
    });

    export { branchModule };