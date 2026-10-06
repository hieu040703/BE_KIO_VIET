import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailLeaveTypes } from "@/database/models/retail/RetailGenericEntities";
import { RetailLeaveTypesRepository } from "./leaveTypes.repository";
import { RETAIL_LEAVE_TYPES_TYPES } from "./leaveTypes.types";

@injectable()
export class RetailLeaveTypesService extends BaseService<RetailLeaveTypes> {
  constructor(@inject(RETAIL_LEAVE_TYPES_TYPES.Repository) repository: RetailLeaveTypesRepository) {
    super(repository);
  }
}
