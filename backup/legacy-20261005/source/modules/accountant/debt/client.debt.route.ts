import { Router } from "express";
import { injectable, inject } from "inversify";
import { DebtController } from "./debt.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateDebtSchema, UpdateDebtSchema, DebtQuerySchema, DebtParamsSchema } from "./debt.validator";
import { DEBT_TYPES } from "./debt.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class ClientDebtRouter {
  private router: Router;

  constructor(@inject(DEBT_TYPES.DebtController) private debtController: DebtController) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All debt routes require authentication
    // this.router.use(authenticate);

    // GET /debts - Get all debts with filters
    this.router.get(
      "/",
      zodValidate(DebtQuerySchema, "query"),
      this.debtController.getDebtByCustomerId.bind(this.debtController),
    );

    // GET /debts/:id/current - Get debt in time
    this.router.get(
      "/:id/current",
      zodValidate(DebtParamsSchema, "params"),
      this.debtController.calculateCustomerDebtAtTime.bind(this.debtController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
