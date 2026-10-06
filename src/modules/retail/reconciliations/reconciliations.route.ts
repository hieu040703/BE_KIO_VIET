import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailReconciliationsController } from "./reconciliations.controller";
import { RETAIL_RECONCILIATIONS_TYPES } from "./reconciliations.types";
import { reconciliationsBodySchema, reconciliationsIdParamsSchema, reconciliationsQuerySchema } from "./reconciliations.validator";

@injectable()
export class RetailReconciliationsRouter {
  private router: Router;

  constructor(@inject(RETAIL_RECONCILIATIONS_TYPES.Controller) private reconciliationsController: RetailReconciliationsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "reconciliations": ["read"] }),
      zodValidate(reconciliationsQuerySchema, "query"),
      this.reconciliationsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "reconciliations": ["create"] }),
      zodValidate(reconciliationsBodySchema, "body"),
      this.reconciliationsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "reconciliations": ["read"] }),
      zodValidate(reconciliationsIdParamsSchema, "params"),
      this.reconciliationsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "reconciliations": ["update"] }),
      zodValidate(reconciliationsIdParamsSchema, "params"),
      zodValidate(reconciliationsBodySchema, "body"),
      this.reconciliationsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "reconciliations": ["delete"] }),
      zodValidate(reconciliationsIdParamsSchema, "params"),
      this.reconciliationsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
