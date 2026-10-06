import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailJobLogs } from "@/database/models/retail/RetailGenericEntities";
import { RetailJobLogsRepository } from "./jobLogs.repository";
import { RETAIL_JOB_LOGS_TYPES } from "./jobLogs.types";

@injectable()
export class RetailJobLogsService extends BaseService<RetailJobLogs> {
  constructor(@inject(RETAIL_JOB_LOGS_TYPES.Repository) repository: RetailJobLogsRepository) {
    super(repository);
  }
}
