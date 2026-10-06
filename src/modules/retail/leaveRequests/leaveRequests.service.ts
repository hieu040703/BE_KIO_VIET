import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailLeaveRequests } from "@/database/models/retail/RetailGenericEntities";
import { RetailLeaveRequestsRepository } from "./leaveRequests.repository";
import { RETAIL_LEAVE_REQUESTS_TYPES } from "./leaveRequests.types";

@injectable()
export class RetailLeaveRequestsService extends BaseService<RetailLeaveRequests> {
  constructor(@inject(RETAIL_LEAVE_REQUESTS_TYPES.Repository) repository: RetailLeaveRequestsRepository) {
    super(repository);
  }
}
