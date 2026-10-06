import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailBonusesController } from "./bonuses.controller";
import { RETAIL_BONUSES_TYPES } from "./bonuses.types";
import { bonusesBodySchema, bonusesIdParamsSchema, bonusesQuerySchema } from "./bonuses.validator";

@injectable()
export class RetailBonusesRouter {
  private router: Router;

  constructor(@inject(RETAIL_BONUSES_TYPES.Controller) private bonusesController: RetailBonusesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "bonuses": ["read"] }),
      zodValidate(bonusesQuerySchema, "query"),
      this.bonusesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "bonuses": ["create"] }),
      zodValidate(bonusesBodySchema, "body"),
      this.bonusesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "bonuses": ["read"] }),
      zodValidate(bonusesIdParamsSchema, "params"),
      this.bonusesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "bonuses": ["update"] }),
      zodValidate(bonusesIdParamsSchema, "params"),
      zodValidate(bonusesBodySchema, "body"),
      this.bonusesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "bonuses": ["delete"] }),
      zodValidate(bonusesIdParamsSchema, "params"),
      this.bonusesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
