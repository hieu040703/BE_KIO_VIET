import { injectable, inject } from "inversify";
import { RetailJobLogsService } from "./jobLogs.service";
import { RETAIL_JOB_LOGS_TYPES } from "./jobLogs.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailJobLogsController extends BaseController<RetailJobLogsService> {
  constructor(@inject(RETAIL_JOB_LOGS_TYPES.Service) protected service: RetailJobLogsService) {
    super(service);
  }
}
