import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCashbooksController } from "./cashbooks.controller";
import { RETAIL_CASHBOOKS_TYPES } from "./cashbooks.types";
import { cashbooksBodySchema, cashbooksIdParamsSchema, cashbooksQuerySchema } from "./cashbooks.validator";

@injectable()
export class RetailCashbooksRouter {
  private router: Router;

  constructor(@inject(RETAIL_CASHBOOKS_TYPES.Controller) private cashbooksController: RetailCashbooksController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "cashbooks": ["read"] }),
      zodValidate(cashbooksQuerySchema, "query"),
      this.cashbooksController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "cashbooks": ["create"] }),
      zodValidate(cashbooksBodySchema, "body"),
      this.cashbooksController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "cashbooks": ["read"] }),
      zodValidate(cashbooksIdParamsSchema, "params"),
      this.cashbooksController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "cashbooks": ["update"] }),
      zodValidate(cashbooksIdParamsSchema, "params"),
      zodValidate(cashbooksBodySchema, "body"),
      this.cashbooksController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "cashbooks": ["delete"] }),
      zodValidate(cashbooksIdParamsSchema, "params"),
      this.cashbooksController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
