import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCartItemsController } from "./cartItems.controller";
import { RETAIL_CART_ITEMS_TYPES } from "./cartItems.types";
import { cartItemsBodySchema, cartItemsIdParamsSchema, cartItemsQuerySchema } from "./cartItems.validator";

@injectable()
export class RetailCartItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CART_ITEMS_TYPES.Controller) private cartItemsController: RetailCartItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "cart-items": ["read"] }),
      zodValidate(cartItemsQuerySchema, "query"),
      this.cartItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "cart-items": ["create"] }),
      zodValidate(cartItemsBodySchema, "body"),
      this.cartItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "cart-items": ["read"] }),
      zodValidate(cartItemsIdParamsSchema, "params"),
      this.cartItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "cart-items": ["update"] }),
      zodValidate(cartItemsIdParamsSchema, "params"),
      zodValidate(cartItemsBodySchema, "body"),
      this.cartItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "cart-items": ["delete"] }),
      zodValidate(cartItemsIdParamsSchema, "params"),
      this.cartItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
