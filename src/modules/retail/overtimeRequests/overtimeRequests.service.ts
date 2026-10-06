import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailOvertimeRequests } from "@/database/models/retail/RetailGenericEntities";
import { RetailOvertimeRequestsRepository } from "./overtimeRequests.repository";
import { RETAIL_OVERTIME_REQUESTS_TYPES } from "./overtimeRequests.types";

@injectable()
export class RetailOvertimeRequestsService extends BaseService<RetailOvertimeRequests> {
  constructor(@inject(RETAIL_OVERTIME_REQUESTS_TYPES.Repository) repository: RetailOvertimeRequestsRepository) {
    super(repository);
  }
}
