import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailRefundsController } from "./refunds.controller";
import { RETAIL_REFUNDS_TYPES } from "./refunds.types";
import { refundsBodySchema, refundsIdParamsSchema, refundsQuerySchema } from "./refunds.validator";

@injectable()
export class RetailRefundsRouter {
  private router: Router;

  constructor(@inject(RETAIL_REFUNDS_TYPES.Controller) private refundsController: RetailRefundsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "refunds": ["read"] }),
      zodValidate(refundsQuerySchema, "query"),
      this.refundsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "refunds": ["create"] }),
      zodValidate(refundsBodySchema, "body"),
      this.refundsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "refunds": ["read"] }),
      zodValidate(refundsIdParamsSchema, "params"),
      this.refundsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "refunds": ["update"] }),
      zodValidate(refundsIdParamsSchema, "params"),
      zodValidate(refundsBodySchema, "body"),
      this.refundsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "refunds": ["delete"] }),
      zodValidate(refundsIdParamsSchema, "params"),
      this.refundsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
