import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailTagsController } from "./tags.controller";
import { RETAIL_TAGS_TYPES } from "./tags.types";
import { tagsBodySchema, tagsIdParamsSchema, tagsQuerySchema } from "./tags.validator";

@injectable()
export class RetailTagsRouter {
  private router: Router;

  constructor(@inject(RETAIL_TAGS_TYPES.Controller) private tagsController: RetailTagsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "tags": ["read"] }),
      zodValidate(tagsQuerySchema, "query"),
      this.tagsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "tags": ["create"] }),
      zodValidate(tagsBodySchema, "body"),
      this.tagsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "tags": ["read"] }),
      zodValidate(tagsIdParamsSchema, "params"),
      this.tagsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "tags": ["update"] }),
      zodValidate(tagsIdParamsSchema, "params"),
      zodValidate(tagsBodySchema, "body"),
      this.tagsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "tags": ["delete"] }),
      zodValidate(tagsIdParamsSchema, "params"),
      this.tagsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
