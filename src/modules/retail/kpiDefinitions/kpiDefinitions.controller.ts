import { injectable, inject } from "inversify";
import { RetailKpiDefinitionsService } from "./kpiDefinitions.service";
import { RETAIL_KPI_DEFINITIONS_TYPES } from "./kpiDefinitions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailKpiDefinitionsController extends BaseController<RetailKpiDefinitionsService> {
  constructor(@inject(RETAIL_KPI_DEFINITIONS_TYPES.Service) protected service: RetailKpiDefinitionsService) {
    super(service);
  }
}
