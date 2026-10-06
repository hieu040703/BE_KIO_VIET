import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAttributeValuesController } from "./attributeValues.controller";
import { RETAIL_ATTRIBUTE_VALUES_TYPES } from "./attributeValues.types";
import { attributeValuesBodySchema, attributeValuesIdParamsSchema, attributeValuesQuerySchema } from "./attributeValues.validator";

@injectable()
export class RetailAttributeValuesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ATTRIBUTE_VALUES_TYPES.Controller) private attributeValuesController: RetailAttributeValuesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "attribute-values": ["read"] }),
      zodValidate(attributeValuesQuerySchema, "query"),
      this.attributeValuesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "attribute-values": ["create"] }),
      zodValidate(attributeValuesBodySchema, "body"),
      this.attributeValuesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "attribute-values": ["read"] }),
      zodValidate(attributeValuesIdParamsSchema, "params"),
      this.attributeValuesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "attribute-values": ["update"] }),
      zodValidate(attributeValuesIdParamsSchema, "params"),
      zodValidate(attributeValuesBodySchema, "body"),
      this.attributeValuesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "attribute-values": ["delete"] }),
      zodValidate(attributeValuesIdParamsSchema, "params"),
      this.attributeValuesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
