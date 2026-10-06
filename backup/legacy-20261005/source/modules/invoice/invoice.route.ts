import { Router } from "express";
import { injectable, inject } from "inversify";
import { InvoiceController } from "./invoice.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateInvoiceSchema, UpdateInvoiceSchema, InvoiceQuerySchema, InvoiceParamsSchema } from "./invoice.validator";
import { INVOICE_TYPES } from "./invoice.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class InvoiceRouter {
  private router: Router;

  constructor(@inject(INVOICE_TYPES.InvoiceController) private invoiceController: InvoiceController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All invoice routes require authentication
    // this.router.use(authenticate);

    // GET /invoices - Get all invoices with filters
    this.router.get(
      "/",
      permissionMiddleware({ invoice: ["read"] }),
      zodValidate(InvoiceQuerySchema, "query"),
      this.invoiceController.getAllWithPagination,
    );

    // POST /invoices - Create new invoice
    this.router.post(
      "/",
      permissionMiddleware({ invoice: ["create"] }),
      zodValidate(CreateInvoiceSchema, "body"),
      this.invoiceController.create,
    );

    // GET /invoices/:id - Get invoice by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ invoice: ["read"] }),
      zodValidate(InvoiceParamsSchema, "params"),
      this.invoiceController.getById,
    );

    // PUT /invoices/:id - Update invoice
    this.router.put(
      "/:id",
      permissionMiddleware({ invoice: ["update"] }),
      zodValidate(InvoiceParamsSchema, "params"),
      zodValidate(UpdateInvoiceSchema, "body"),
      this.invoiceController.update,
    );

    // DELETE /invoices/:id - Delete invoice
    this.router.delete(
      "/:id",
      permissionMiddleware({ invoice: ["delete"] }),
      zodValidate(InvoiceParamsSchema, "params"),
      this.invoiceController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
