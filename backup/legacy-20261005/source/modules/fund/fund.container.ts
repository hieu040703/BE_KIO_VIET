
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {FundController} from "./fund.controller";
    import {FundService} from "./fund.service";
    import {FundRepository} from "./fund.repository";
    import {FundRouter} from "./fund.route";
    import {FUND_TYPES } from "./fund.types";



    const fundModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<FundService>(FUND_TYPES.FundService).to(FundService);
      options.bind<FundController>(FUND_TYPES.FundController).to(FundController);
      options.bind<FundRepository>(FUND_TYPES.FundRepository).to(FundRepository);
      options.bind<FundRouter>(FUND_TYPES.FundRouter).to(FundRouter);
    });

    export { fundModule };