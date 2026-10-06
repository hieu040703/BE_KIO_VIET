import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailUnitsController } from "./units.controller";
import { RETAIL_UNITS_TYPES } from "./units.types";
import { unitsBodySchema, unitsIdParamsSchema, unitsQuerySchema } from "./units.validator";

@injectable()
export class RetailUnitsRouter {
  private router: Router;

  constructor(@inject(RETAIL_UNITS_TYPES.Controller) private unitsController: RetailUnitsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "units": ["read"] }),
      zodValidate(unitsQuerySchema, "query"),
      this.unitsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "units": ["create"] }),
      zodValidate(unitsBodySchema, "body"),
      this.unitsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "units": ["read"] }),
      zodValidate(unitsIdParamsSchema, "params"),
      this.unitsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "units": ["update"] }),
      zodValidate(unitsIdParamsSchema, "params"),
      zodValidate(unitsBodySchema, "body"),
      this.unitsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "units": ["delete"] }),
      zodValidate(unitsIdParamsSchema, "params"),
      this.unitsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
