import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEntityTagsController } from "./entityTags.controller";
import { RETAIL_ENTITY_TAGS_TYPES } from "./entityTags.types";
import { entityTagsBodySchema, entityTagsIdParamsSchema, entityTagsQuerySchema } from "./entityTags.validator";

@injectable()
export class RetailEntityTagsRouter {
  private router: Router;

  constructor(@inject(RETAIL_ENTITY_TAGS_TYPES.Controller) private entityTagsController: RetailEntityTagsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "entity-tags": ["read"] }),
      zodValidate(entityTagsQuerySchema, "query"),
      this.entityTagsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "entity-tags": ["create"] }),
      zodValidate(entityTagsBodySchema, "body"),
      this.entityTagsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "entity-tags": ["read"] }),
      zodValidate(entityTagsIdParamsSchema, "params"),
      this.entityTagsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "entity-tags": ["update"] }),
      zodValidate(entityTagsIdParamsSchema, "params"),
      zodValidate(entityTagsBodySchema, "body"),
      this.entityTagsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "entity-tags": ["delete"] }),
      zodValidate(entityTagsIdParamsSchema, "params"),
      this.entityTagsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
