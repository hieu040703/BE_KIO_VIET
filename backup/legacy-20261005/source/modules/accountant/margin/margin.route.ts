import { Router } from "express";
import { injectable, inject } from "inversify";
import { MarginController } from "./margin.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateMarginSchema, UpdateMarginSchema, MarginQuerySchema, MarginParamsSchema } from "./margin.validator";
import { MARGIN_TYPES } from "./margin.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class MarginRouter {
  private router: Router;

  constructor(@inject(MARGIN_TYPES.MarginController) private marginController: MarginController) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /margins - Get all margins with filters
    this.router.get(
      "/",
      permissionMiddleware({ margin: ["read"] }),
      zodValidate(MarginQuerySchema, "query"),
      this.marginController.getAllWithPagination,
    );

    // POST /margins/refund/:id - Refund margin
    this.router.post(
      "/:id/refund",
      permissionMiddleware({ margin: ["update"] }),
      zodValidate(MarginParamsSchema, "params"),
      this.marginController.refundMargin,
    );

    // POST /margins - Create new margin
    this.router.post(
      "/",
      permissionMiddleware({ margin: ["create"] }),
      zodValidate(CreateMarginSchema, "body"),
      this.marginController.create,
    );

    // GET /margins/:id - Get margin by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ margin: ["read"] }),
      zodValidate(MarginParamsSchema, "params"),
      this.marginController.getById,
    );

    // PUT /margins/:id - Update margin
    this.router.put(
      "/:id",
      permissionMiddleware({ margin: ["update"] }),
      zodValidate(MarginParamsSchema, "params"),
      zodValidate(UpdateMarginSchema, "body"),
      this.marginController.update,
    );

    // DELETE /margins/:id - Delete margin
    this.router.delete(
      "/:id",
      permissionMiddleware({ margin: ["delete"] }),
      zodValidate(MarginParamsSchema, "params"),
      this.marginController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
