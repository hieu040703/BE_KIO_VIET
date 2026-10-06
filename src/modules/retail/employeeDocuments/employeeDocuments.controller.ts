import { injectable, inject } from "inversify";
import { RetailEmployeeDocumentsService } from "./employeeDocuments.service";
import { RETAIL_EMPLOYEE_DOCUMENTS_TYPES } from "./employeeDocuments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeDocumentsController extends BaseController<RetailEmployeeDocumentsService> {
  constructor(@inject(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Service) protected service: RetailEmployeeDocumentsService) {
    super(service);
  }
}
