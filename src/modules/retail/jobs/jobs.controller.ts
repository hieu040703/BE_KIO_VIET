import { injectable, inject } from "inversify";
import { RetailJobsService } from "./jobs.service";
import { RETAIL_JOBS_TYPES } from "./jobs.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailJobsController extends BaseController<RetailJobsService> {
  constructor(@inject(RETAIL_JOBS_TYPES.Service) protected service: RetailJobsService) {
    super(service);
  }
}
