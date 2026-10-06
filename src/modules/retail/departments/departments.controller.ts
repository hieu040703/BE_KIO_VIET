import { injectable, inject } from "inversify";
import { RetailDepartmentsService } from "./departments.service";
import { RETAIL_DEPARTMENTS_TYPES } from "./departments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailDepartmentsController extends BaseController<RetailDepartmentsService> {
  constructor(@inject(RETAIL_DEPARTMENTS_TYPES.Service) protected service: RetailDepartmentsService) {
    super(service);
  }
}
