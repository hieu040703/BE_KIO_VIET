import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSuppliersController } from "./suppliers.controller";
import { RETAIL_SUPPLIERS_TYPES } from "./suppliers.types";
import { suppliersBodySchema, suppliersIdParamsSchema, suppliersQuerySchema } from "./suppliers.validator";

@injectable()
export class RetailSuppliersRouter {
  private router: Router;

  constructor(@inject(RETAIL_SUPPLIERS_TYPES.Controller) private suppliersController: RetailSuppliersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "suppliers": ["read"] }),
      zodValidate(suppliersQuerySchema, "query"),
      this.suppliersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "suppliers": ["create"] }),
      zodValidate(suppliersBodySchema, "body"),
      this.suppliersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "suppliers": ["read"] }),
      zodValidate(suppliersIdParamsSchema, "params"),
      this.suppliersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "suppliers": ["update"] }),
      zodValidate(suppliersIdParamsSchema, "params"),
      zodValidate(suppliersBodySchema, "body"),
      this.suppliersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "suppliers": ["delete"] }),
      zodValidate(suppliersIdParamsSchema, "params"),
      this.suppliersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
