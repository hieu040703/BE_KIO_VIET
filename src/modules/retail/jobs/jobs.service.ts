import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailJobs } from "@/database/models/retail/RetailGenericEntities";
import { RetailJobsRepository } from "./jobs.repository";
import { RETAIL_JOBS_TYPES } from "./jobs.types";

@injectable()
export class RetailJobsService extends BaseService<RetailJobs> {
  constructor(@inject(RETAIL_JOBS_TYPES.Repository) repository: RetailJobsRepository) {
    super(repository);
  }
}
