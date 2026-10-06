import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailExchangesController } from "./exchanges.controller";
import { RETAIL_EXCHANGES_TYPES } from "./exchanges.types";
import { exchangesBodySchema, exchangesIdParamsSchema, exchangesQuerySchema } from "./exchanges.validator";

@injectable()
export class RetailExchangesRouter {
  private router: Router;

  constructor(@inject(RETAIL_EXCHANGES_TYPES.Controller) private exchangesController: RetailExchangesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "exchanges": ["read"] }),
      zodValidate(exchangesQuerySchema, "query"),
      this.exchangesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "exchanges": ["create"] }),
      zodValidate(exchangesBodySchema, "body"),
      this.exchangesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "exchanges": ["read"] }),
      zodValidate(exchangesIdParamsSchema, "params"),
      this.exchangesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "exchanges": ["update"] }),
      zodValidate(exchangesIdParamsSchema, "params"),
      zodValidate(exchangesBodySchema, "body"),
      this.exchangesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "exchanges": ["delete"] }),
      zodValidate(exchangesIdParamsSchema, "params"),
      this.exchangesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
