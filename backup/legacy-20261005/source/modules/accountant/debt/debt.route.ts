import { Router } from "express";
import { injectable, inject } from "inversify";
import { DebtController } from "./debt.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateDebtSchema, UpdateDebtSchema, DebtQuerySchema, DebtParamsSchema } from "./debt.validator";
import { DEBT_TYPES } from "./debt.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class DebtRouter {
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
      permissionMiddleware({ debt: ["read"] }),
      zodValidate(DebtQuerySchema, "query"),
      this.debtController.getAllWithPagination,
    );

    // POST /debts - Create new debt
    this.router.post(
      "/",
      permissionMiddleware({ debt: ["create"] }),
      zodValidate(CreateDebtSchema, "body"),
      this.debtController.create,
    );

    // GET /debts/:id/current - Get debt in time
    this.router.get(
      "/:id/current",
      permissionMiddleware({ debt: ["read"] }),
      zodValidate(DebtParamsSchema, "params"),
      this.debtController.calculateCustomerDebtAtTime.bind(this.debtController),
    );

    // GET /debts/:id - Get debt by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ debt: ["read"] }),
      zodValidate(DebtParamsSchema, "params"),
      zodValidate(DebtQuerySchema, "query"),
      this.debtController.getDebtByCustomerId.bind(this.debtController),
    );

    // PUT /debts/:id - Update debt
    this.router.put(
      "/:id",
      permissionMiddleware({ debt: ["update"] }),
      zodValidate(DebtParamsSchema, "params"),
      zodValidate(UpdateDebtSchema, "body"),
      this.debtController.update,
    );

    // DELETE /debts/:id - Delete debt
    this.router.delete(
      "/:id",
      permissionMiddleware({ debt: ["delete"] }),
      zodValidate(DebtParamsSchema, "params"),
      this.debtController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
