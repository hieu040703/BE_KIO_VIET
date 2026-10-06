import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailHolidaysController } from "./holidays.controller";
import { RETAIL_HOLIDAYS_TYPES } from "./holidays.types";
import { holidaysBodySchema, holidaysIdParamsSchema, holidaysQuerySchema } from "./holidays.validator";

@injectable()
export class RetailHolidaysRouter {
  private router: Router;

  constructor(@inject(RETAIL_HOLIDAYS_TYPES.Controller) private holidaysController: RetailHolidaysController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "holidays": ["read"] }),
      zodValidate(holidaysQuerySchema, "query"),
      this.holidaysController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "holidays": ["create"] }),
      zodValidate(holidaysBodySchema, "body"),
      this.holidaysController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "holidays": ["read"] }),
      zodValidate(holidaysIdParamsSchema, "params"),
      this.holidaysController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "holidays": ["update"] }),
      zodValidate(holidaysIdParamsSchema, "params"),
      zodValidate(holidaysBodySchema, "body"),
      this.holidaysController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "holidays": ["delete"] }),
      zodValidate(holidaysIdParamsSchema, "params"),
      this.holidaysController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
