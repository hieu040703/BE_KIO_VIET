import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPositionsController } from "./positions.controller";
import { RETAIL_POSITIONS_TYPES } from "./positions.types";
import { positionsBodySchema, positionsIdParamsSchema, positionsQuerySchema } from "./positions.validator";

@injectable()
export class RetailPositionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_POSITIONS_TYPES.Controller) private positionsController: RetailPositionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "positions": ["read"] }),
      zodValidate(positionsQuerySchema, "query"),
      this.positionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "positions": ["create"] }),
      zodValidate(positionsBodySchema, "body"),
      this.positionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "positions": ["read"] }),
      zodValidate(positionsIdParamsSchema, "params"),
      this.positionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "positions": ["update"] }),
      zodValidate(positionsIdParamsSchema, "params"),
      zodValidate(positionsBodySchema, "body"),
      this.positionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "positions": ["delete"] }),
      zodValidate(positionsIdParamsSchema, "params"),
      this.positionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
