import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailApiKeysController } from "./apiKeys.controller";
import { RETAIL_API_KEYS_TYPES } from "./apiKeys.types";
import { apiKeysBodySchema, apiKeysIdParamsSchema, apiKeysQuerySchema } from "./apiKeys.validator";

@injectable()
export class RetailApiKeysRouter {
  private router: Router;

  constructor(@inject(RETAIL_API_KEYS_TYPES.Controller) private apiKeysController: RetailApiKeysController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "api-keys": ["read"] }),
      zodValidate(apiKeysQuerySchema, "query"),
      this.apiKeysController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "api-keys": ["create"] }),
      zodValidate(apiKeysBodySchema, "body"),
      this.apiKeysController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "api-keys": ["read"] }),
      zodValidate(apiKeysIdParamsSchema, "params"),
      this.apiKeysController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "api-keys": ["update"] }),
      zodValidate(apiKeysIdParamsSchema, "params"),
      zodValidate(apiKeysBodySchema, "body"),
      this.apiKeysController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "api-keys": ["delete"] }),
      zodValidate(apiKeysIdParamsSchema, "params"),
      this.apiKeysController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
