import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailReturnItemsController } from "./returnItems.controller";
import { RETAIL_RETURN_ITEMS_TYPES } from "./returnItems.types";
import { returnItemsBodySchema, returnItemsIdParamsSchema, returnItemsQuerySchema } from "./returnItems.validator";

@injectable()
export class RetailReturnItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_RETURN_ITEMS_TYPES.Controller) private returnItemsController: RetailReturnItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "return-items": ["read"] }),
      zodValidate(returnItemsQuerySchema, "query"),
      this.returnItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "return-items": ["create"] }),
      zodValidate(returnItemsBodySchema, "body"),
      this.returnItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "return-items": ["read"] }),
      zodValidate(returnItemsIdParamsSchema, "params"),
      this.returnItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "return-items": ["update"] }),
      zodValidate(returnItemsIdParamsSchema, "params"),
      zodValidate(returnItemsBodySchema, "body"),
      this.returnItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "return-items": ["delete"] }),
      zodValidate(returnItemsIdParamsSchema, "params"),
      this.returnItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
