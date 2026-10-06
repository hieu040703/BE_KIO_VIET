import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCashSessionsController } from "./cashSessions.controller";
import { RETAIL_CASH_SESSIONS_TYPES } from "./cashSessions.types";
import { cashSessionsBodySchema, cashSessionsIdParamsSchema, cashSessionsQuerySchema } from "./cashSessions.validator";

@injectable()
export class RetailCashSessionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CASH_SESSIONS_TYPES.Controller) private cashSessionsController: RetailCashSessionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "cash-sessions": ["read"] }),
      zodValidate(cashSessionsQuerySchema, "query"),
      this.cashSessionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "cash-sessions": ["create"] }),
      zodValidate(cashSessionsBodySchema, "body"),
      this.cashSessionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "cash-sessions": ["read"] }),
      zodValidate(cashSessionsIdParamsSchema, "params"),
      this.cashSessionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "cash-sessions": ["update"] }),
      zodValidate(cashSessionsIdParamsSchema, "params"),
      zodValidate(cashSessionsBodySchema, "body"),
      this.cashSessionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "cash-sessions": ["delete"] }),
      zodValidate(cashSessionsIdParamsSchema, "params"),
      this.cashSessionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
