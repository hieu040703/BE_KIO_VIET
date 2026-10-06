import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeKpis } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeKpisRepository } from "./employeeKpis.repository";
import { RETAIL_EMPLOYEE_KPIS_TYPES } from "./employeeKpis.types";

@injectable()
export class RetailEmployeeKpisService extends BaseService<RetailEmployeeKpis> {
  constructor(@inject(RETAIL_EMPLOYEE_KPIS_TYPES.Repository) repository: RetailEmployeeKpisRepository) {
    super(repository);
  }
}
