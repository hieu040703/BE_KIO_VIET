import { injectable } from "inversify";
import { RetailKpiDefinitions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { KPIDEFINITIONS_RESOURCE } from "./kpiDefinitions.types";

@injectable()
export class RetailKpiDefinitionsRepository extends BaseRepository<RetailKpiDefinitions> {
  protected entityClass = RetailKpiDefinitions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[KPIDEFINITIONS_RESOURCE];
  }
}
