import { Router } from "express";
import { injectable, inject } from "inversify";
import { FinanceController } from "./finance.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateFinanceSchema, UpdateFinanceSchema, FinanceQuerySchema, FinanceParamsSchema } from "./finance.validator";
import { FINANCE_TYPES } from "./finance.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class FinanceRouter {
  private router: Router;

  constructor(@inject(FINANCE_TYPES.FinanceController) private financeController: FinanceController) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All finance routes require authentication
    // this.router.use(authenticate);

    // GET /finances - Get all finances with filters
    this.router.get(
      "/",
      permissionMiddleware({ finance: ["read"] }),
      zodValidate(FinanceQuerySchema, "query"),
      this.financeController.getAllWithPagination,
    );

    // POST /finances - Create new finance
    this.router.post(
      "/",
      permissionMiddleware({ finance: ["create"] }),
      zodValidate(CreateFinanceSchema, "body"),
      this.financeController.create.bind(this.financeController),
    );

    // GET /finances/:id - Get finance by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ finance: ["read"] }),
      zodValidate(FinanceParamsSchema, "params"),
      this.financeController.getById.bind(this.financeController),
    );

    // PUT /finances/:id - Update finance
    this.router.put(
      "/:id",
      permissionMiddleware({ finance: ["update"] }),
      zodValidate(FinanceParamsSchema, "params"),
      zodValidate(UpdateFinanceSchema, "body"),
      this.financeController.update.bind(this.financeController),
    );

    // DELETE /finances/:id - Delete finance
    this.router.delete(
      "/:id",
      permissionMiddleware({ finance: ["delete"] }),
      zodValidate(FinanceParamsSchema, "params"),
      this.financeController.delete.bind(this.financeController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
