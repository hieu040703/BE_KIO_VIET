import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailInvoicesController } from "./invoices.controller";
import { RETAIL_INVOICES_TYPES } from "./invoices.types";
import { invoicesBodySchema, invoicesIdParamsSchema, invoicesQuerySchema } from "./invoices.validator";

@injectable()
export class RetailInvoicesRouter {
  private router: Router;

  constructor(@inject(RETAIL_INVOICES_TYPES.Controller) private invoicesController: RetailInvoicesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "invoices": ["read"] }),
      zodValidate(invoicesQuerySchema, "query"),
      this.invoicesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "invoices": ["create"] }),
      zodValidate(invoicesBodySchema, "body"),
      this.invoicesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "invoices": ["read"] }),
      zodValidate(invoicesIdParamsSchema, "params"),
      this.invoicesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "invoices": ["update"] }),
      zodValidate(invoicesIdParamsSchema, "params"),
      zodValidate(invoicesBodySchema, "body"),
      this.invoicesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "invoices": ["delete"] }),
      zodValidate(invoicesIdParamsSchema, "params"),
      this.invoicesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
