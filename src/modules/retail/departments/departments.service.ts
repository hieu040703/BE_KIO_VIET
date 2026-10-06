import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailDepartments } from "@/database/models/retail/RetailGenericEntities";
import { RetailDepartmentsRepository } from "./departments.repository";
import { RETAIL_DEPARTMENTS_TYPES } from "./departments.types";

@injectable()
export class RetailDepartmentsService extends BaseService<RetailDepartments> {
  constructor(@inject(RETAIL_DEPARTMENTS_TYPES.Repository) repository: RetailDepartmentsRepository) {
    super(repository);
  }
}
