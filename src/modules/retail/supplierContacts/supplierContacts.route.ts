import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSupplierContactsController } from "./supplierContacts.controller";
import { RETAIL_SUPPLIER_CONTACTS_TYPES } from "./supplierContacts.types";
import { supplierContactsBodySchema, supplierContactsIdParamsSchema, supplierContactsQuerySchema } from "./supplierContacts.validator";

@injectable()
export class RetailSupplierContactsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SUPPLIER_CONTACTS_TYPES.Controller) private supplierContactsController: RetailSupplierContactsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "supplier-contacts": ["read"] }),
      zodValidate(supplierContactsQuerySchema, "query"),
      this.supplierContactsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "supplier-contacts": ["create"] }),
      zodValidate(supplierContactsBodySchema, "body"),
      this.supplierContactsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "supplier-contacts": ["read"] }),
      zodValidate(supplierContactsIdParamsSchema, "params"),
      this.supplierContactsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "supplier-contacts": ["update"] }),
      zodValidate(supplierContactsIdParamsSchema, "params"),
      zodValidate(supplierContactsBodySchema, "body"),
      this.supplierContactsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "supplier-contacts": ["delete"] }),
      zodValidate(supplierContactsIdParamsSchema, "params"),
      this.supplierContactsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
