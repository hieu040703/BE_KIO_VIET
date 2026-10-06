import { injectable } from "inversify";
import { RetailJobs } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { JOBS_RESOURCE } from "./jobs.types";

@injectable()
export class RetailJobsRepository extends BaseRepository<RetailJobs> {
  protected entityClass = RetailJobs;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[JOBS_RESOURCE];
  }
}
