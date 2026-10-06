import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailLoyaltyAccountsController } from "./loyaltyAccounts.controller";
import { RETAIL_LOYALTY_ACCOUNTS_TYPES } from "./loyaltyAccounts.types";
import { loyaltyAccountsBodySchema, loyaltyAccountsIdParamsSchema, loyaltyAccountsQuerySchema } from "./loyaltyAccounts.validator";

@injectable()
export class RetailLoyaltyAccountsRouter {
  private router: Router;

  constructor(@inject(RETAIL_LOYALTY_ACCOUNTS_TYPES.Controller) private loyaltyAccountsController: RetailLoyaltyAccountsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "loyalty-accounts": ["read"] }),
      zodValidate(loyaltyAccountsQuerySchema, "query"),
      this.loyaltyAccountsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "loyalty-accounts": ["create"] }),
      zodValidate(loyaltyAccountsBodySchema, "body"),
      this.loyaltyAccountsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "loyalty-accounts": ["read"] }),
      zodValidate(loyaltyAccountsIdParamsSchema, "params"),
      this.loyaltyAccountsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "loyalty-accounts": ["update"] }),
      zodValidate(loyaltyAccountsIdParamsSchema, "params"),
      zodValidate(loyaltyAccountsBodySchema, "body"),
      this.loyaltyAccountsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "loyalty-accounts": ["delete"] }),
      zodValidate(loyaltyAccountsIdParamsSchema, "params"),
      this.loyaltyAccountsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
