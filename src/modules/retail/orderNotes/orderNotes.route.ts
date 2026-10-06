import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOrderNotesController } from "./orderNotes.controller";
import { RETAIL_ORDER_NOTES_TYPES } from "./orderNotes.types";
import { orderNotesBodySchema, orderNotesIdParamsSchema, orderNotesQuerySchema } from "./orderNotes.validator";

@injectable()
export class RetailOrderNotesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ORDER_NOTES_TYPES.Controller) private orderNotesController: RetailOrderNotesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "order-notes": ["read"] }),
      zodValidate(orderNotesQuerySchema, "query"),
      this.orderNotesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "order-notes": ["create"] }),
      zodValidate(orderNotesBodySchema, "body"),
      this.orderNotesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "order-notes": ["read"] }),
      zodValidate(orderNotesIdParamsSchema, "params"),
      this.orderNotesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "order-notes": ["update"] }),
      zodValidate(orderNotesIdParamsSchema, "params"),
      zodValidate(orderNotesBodySchema, "body"),
      this.orderNotesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "order-notes": ["delete"] }),
      zodValidate(orderNotesIdParamsSchema, "params"),
      this.orderNotesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
