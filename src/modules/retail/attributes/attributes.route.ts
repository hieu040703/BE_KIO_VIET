import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAttributesController } from "./attributes.controller";
import { RETAIL_ATTRIBUTES_TYPES } from "./attributes.types";
import { attributesBodySchema, attributesIdParamsSchema, attributesQuerySchema } from "./attributes.validator";

@injectable()
export class RetailAttributesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ATTRIBUTES_TYPES.Controller) private attributesController: RetailAttributesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "attributes": ["read"] }),
      zodValidate(attributesQuerySchema, "query"),
      this.attributesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "attributes": ["create"] }),
      zodValidate(attributesBodySchema, "body"),
      this.attributesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "attributes": ["read"] }),
      zodValidate(attributesIdParamsSchema, "params"),
      this.attributesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "attributes": ["update"] }),
      zodValidate(attributesIdParamsSchema, "params"),
      zodValidate(attributesBodySchema, "body"),
      this.attributesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "attributes": ["delete"] }),
      zodValidate(attributesIdParamsSchema, "params"),
      this.attributesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
