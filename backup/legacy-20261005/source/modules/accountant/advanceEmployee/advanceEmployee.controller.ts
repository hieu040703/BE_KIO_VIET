import { injectable, inject } from "inversify";
import { AdvanceEmployeeService } from "./advanceEmployee.service";
import { ADVANCE_EMPLOYEE_TYPES } from "./advanceEmployee.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";
import { GetAdvanceEmployeeSummaryDto } from "./advanceEmployee.validator";

@injectable()
export class AdvanceEmployeeController extends BaseController<AdvanceEmployeeService> {
  constructor(@inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeService) protected service: AdvanceEmployeeService) {
    super(service);
  }

  getAdvanceEmployeeSummary = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      const result = await this.service.getAdvanceEmployeeSummary(
        req.query as unknown as GetAdvanceEmployeeSummaryDto,
        req,
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
