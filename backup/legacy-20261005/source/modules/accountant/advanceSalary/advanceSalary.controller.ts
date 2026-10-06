import { injectable, inject } from "inversify";
import { AdvanceSalaryService } from "./advanceSalary.service";
import { ADVANCE_SALARY_TYPES } from "./advanceSalary.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class AdvanceSalaryController extends BaseController<AdvanceSalaryService> {
  constructor(@inject(ADVANCE_SALARY_TYPES.AdvanceSalaryService) protected service: AdvanceSalaryService) {
    super(service);
  }
}
