import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailReturnsController } from "./returns.controller";
import { RETAIL_RETURNS_TYPES } from "./returns.types";
import { returnsBodySchema, returnsIdParamsSchema, returnsQuerySchema } from "./returns.validator";

@injectable()
export class RetailReturnsRouter {
  private router: Router;

  constructor(@inject(RETAIL_RETURNS_TYPES.Controller) private returnsController: RetailReturnsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "returns": ["read"] }),
      zodValidate(returnsQuerySchema, "query"),
      this.returnsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "returns": ["create"] }),
      zodValidate(returnsBodySchema, "body"),
      this.returnsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "returns": ["read"] }),
      zodValidate(returnsIdParamsSchema, "params"),
      this.returnsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "returns": ["update"] }),
      zodValidate(returnsIdParamsSchema, "params"),
      zodValidate(returnsBodySchema, "body"),
      this.returnsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "returns": ["delete"] }),
      zodValidate(returnsIdParamsSchema, "params"),
      this.returnsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
