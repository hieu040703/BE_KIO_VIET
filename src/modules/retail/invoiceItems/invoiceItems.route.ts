import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailInvoiceItemsController } from "./invoiceItems.controller";
import { RETAIL_INVOICE_ITEMS_TYPES } from "./invoiceItems.types";
import { invoiceItemsBodySchema, invoiceItemsIdParamsSchema, invoiceItemsQuerySchema } from "./invoiceItems.validator";

@injectable()
export class RetailInvoiceItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_INVOICE_ITEMS_TYPES.Controller) private invoiceItemsController: RetailInvoiceItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "invoice-items": ["read"] }),
      zodValidate(invoiceItemsQuerySchema, "query"),
      this.invoiceItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "invoice-items": ["create"] }),
      zodValidate(invoiceItemsBodySchema, "body"),
      this.invoiceItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "invoice-items": ["read"] }),
      zodValidate(invoiceItemsIdParamsSchema, "params"),
      this.invoiceItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "invoice-items": ["update"] }),
      zodValidate(invoiceItemsIdParamsSchema, "params"),
      zodValidate(invoiceItemsBodySchema, "body"),
      this.invoiceItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "invoice-items": ["delete"] }),
      zodValidate(invoiceItemsIdParamsSchema, "params"),
      this.invoiceItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
