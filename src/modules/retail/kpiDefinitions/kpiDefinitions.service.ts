import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailKpiDefinitions } from "@/database/models/retail/RetailGenericEntities";
import { RetailKpiDefinitionsRepository } from "./kpiDefinitions.repository";
import { RETAIL_KPI_DEFINITIONS_TYPES } from "./kpiDefinitions.types";

@injectable()
export class RetailKpiDefinitionsService extends BaseService<RetailKpiDefinitions> {
  constructor(@inject(RETAIL_KPI_DEFINITIONS_TYPES.Repository) repository: RetailKpiDefinitionsRepository) {
    super(repository);
  }
}
