import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCartsController } from "./carts.controller";
import { RETAIL_CARTS_TYPES } from "./carts.types";
import { cartsBodySchema, cartsIdParamsSchema, cartsQuerySchema } from "./carts.validator";

@injectable()
export class RetailCartsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CARTS_TYPES.Controller) private cartsController: RetailCartsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "carts": ["read"] }),
      zodValidate(cartsQuerySchema, "query"),
      this.cartsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "carts": ["create"] }),
      zodValidate(cartsBodySchema, "body"),
      this.cartsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "carts": ["read"] }),
      zodValidate(cartsIdParamsSchema, "params"),
      this.cartsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "carts": ["update"] }),
      zodValidate(cartsIdParamsSchema, "params"),
      zodValidate(cartsBodySchema, "body"),
      this.cartsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "carts": ["delete"] }),
      zodValidate(cartsIdParamsSchema, "params"),
      this.cartsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
