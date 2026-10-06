import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPayroll } from "@/database/models";
import { RetailPayrollsRepository } from "./payrolls.repository";
import { RETAIL_PAYROLLS_TYPES } from "./payrolls.types";

@injectable()
export class RetailPayrollsService extends BaseService<RetailPayroll> {
  constructor(@inject(RETAIL_PAYROLLS_TYPES.Repository) repository: RetailPayrollsRepository) {
    super(repository);
  }
}
