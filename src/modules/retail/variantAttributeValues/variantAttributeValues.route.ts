import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailVariantAttributeValuesController } from "./variantAttributeValues.controller";
import { RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES } from "./variantAttributeValues.types";
import { variantAttributeValuesBodySchema, variantAttributeValuesIdParamsSchema, variantAttributeValuesQuerySchema } from "./variantAttributeValues.validator";

@injectable()
export class RetailVariantAttributeValuesRouter {
  private router: Router;

  constructor(@inject(RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES.Controller) private variantAttributeValuesController: RetailVariantAttributeValuesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "variant-attribute-values": ["read"] }),
      zodValidate(variantAttributeValuesQuerySchema, "query"),
      this.variantAttributeValuesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "variant-attribute-values": ["create"] }),
      zodValidate(variantAttributeValuesBodySchema, "body"),
      this.variantAttributeValuesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "variant-attribute-values": ["read"] }),
      zodValidate(variantAttributeValuesIdParamsSchema, "params"),
      this.variantAttributeValuesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "variant-attribute-values": ["update"] }),
      zodValidate(variantAttributeValuesIdParamsSchema, "params"),
      zodValidate(variantAttributeValuesBodySchema, "body"),
      this.variantAttributeValuesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "variant-attribute-values": ["delete"] }),
      zodValidate(variantAttributeValuesIdParamsSchema, "params"),
      this.variantAttributeValuesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
