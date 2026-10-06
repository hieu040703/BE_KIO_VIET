import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailFulfillmentsController } from "./fulfillments.controller";
import { RETAIL_FULFILLMENTS_TYPES } from "./fulfillments.types";
import { fulfillmentsBodySchema, fulfillmentsIdParamsSchema, fulfillmentsQuerySchema } from "./fulfillments.validator";

@injectable()
export class RetailFulfillmentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_FULFILLMENTS_TYPES.Controller) private fulfillmentsController: RetailFulfillmentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "fulfillments": ["read"] }),
      zodValidate(fulfillmentsQuerySchema, "query"),
      this.fulfillmentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "fulfillments": ["create"] }),
      zodValidate(fulfillmentsBodySchema, "body"),
      this.fulfillmentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "fulfillments": ["read"] }),
      zodValidate(fulfillmentsIdParamsSchema, "params"),
      this.fulfillmentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "fulfillments": ["update"] }),
      zodValidate(fulfillmentsIdParamsSchema, "params"),
      zodValidate(fulfillmentsBodySchema, "body"),
      this.fulfillmentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "fulfillments": ["delete"] }),
      zodValidate(fulfillmentsIdParamsSchema, "params"),
      this.fulfillmentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
