import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPenaltiesController } from "./penalties.controller";
import { RETAIL_PENALTIES_TYPES } from "./penalties.types";
import { penaltiesBodySchema, penaltiesIdParamsSchema, penaltiesQuerySchema } from "./penalties.validator";

@injectable()
export class RetailPenaltiesRouter {
  private router: Router;

  constructor(@inject(RETAIL_PENALTIES_TYPES.Controller) private penaltiesController: RetailPenaltiesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "penalties": ["read"] }),
      zodValidate(penaltiesQuerySchema, "query"),
      this.penaltiesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "penalties": ["create"] }),
      zodValidate(penaltiesBodySchema, "body"),
      this.penaltiesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "penalties": ["read"] }),
      zodValidate(penaltiesIdParamsSchema, "params"),
      this.penaltiesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "penalties": ["update"] }),
      zodValidate(penaltiesIdParamsSchema, "params"),
      zodValidate(penaltiesBodySchema, "body"),
      this.penaltiesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "penalties": ["delete"] }),
      zodValidate(penaltiesIdParamsSchema, "params"),
      this.penaltiesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
