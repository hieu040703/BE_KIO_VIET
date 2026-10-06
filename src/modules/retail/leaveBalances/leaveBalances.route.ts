import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailLeaveBalancesController } from "./leaveBalances.controller";
import { RETAIL_LEAVE_BALANCES_TYPES } from "./leaveBalances.types";
import { leaveBalancesBodySchema, leaveBalancesIdParamsSchema, leaveBalancesQuerySchema } from "./leaveBalances.validator";

@injectable()
export class RetailLeaveBalancesRouter {
  private router: Router;

  constructor(@inject(RETAIL_LEAVE_BALANCES_TYPES.Controller) private leaveBalancesController: RetailLeaveBalancesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "leave-balances": ["read"] }),
      zodValidate(leaveBalancesQuerySchema, "query"),
      this.leaveBalancesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "leave-balances": ["create"] }),
      zodValidate(leaveBalancesBodySchema, "body"),
      this.leaveBalancesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "leave-balances": ["read"] }),
      zodValidate(leaveBalancesIdParamsSchema, "params"),
      this.leaveBalancesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "leave-balances": ["update"] }),
      zodValidate(leaveBalancesIdParamsSchema, "params"),
      zodValidate(leaveBalancesBodySchema, "body"),
      this.leaveBalancesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "leave-balances": ["delete"] }),
      zodValidate(leaveBalancesIdParamsSchema, "params"),
      this.leaveBalancesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
