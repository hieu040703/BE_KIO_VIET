import { injectable } from "inversify";
import { RetailJobLogs } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { JOBLOGS_RESOURCE } from "./jobLogs.types";

@injectable()
export class RetailJobLogsRepository extends BaseRepository<RetailJobLogs> {
  protected entityClass = RetailJobLogs;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[JOBLOGS_RESOURCE];
  }
}
