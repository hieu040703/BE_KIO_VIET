import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeDocuments } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeDocumentsRepository } from "./employeeDocuments.repository";
import { RETAIL_EMPLOYEE_DOCUMENTS_TYPES } from "./employeeDocuments.types";

@injectable()
export class RetailEmployeeDocumentsService extends BaseService<RetailEmployeeDocuments> {
  constructor(@inject(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Repository) repository: RetailEmployeeDocumentsRepository) {
    super(repository);
  }
}
