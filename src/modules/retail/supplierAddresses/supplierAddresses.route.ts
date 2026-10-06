import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSupplierAddressesController } from "./supplierAddresses.controller";
import { RETAIL_SUPPLIER_ADDRESSES_TYPES } from "./supplierAddresses.types";
import { supplierAddressesBodySchema, supplierAddressesIdParamsSchema, supplierAddressesQuerySchema } from "./supplierAddresses.validator";

@injectable()
export class RetailSupplierAddressesRouter {
  private router: Router;

  constructor(@inject(RETAIL_SUPPLIER_ADDRESSES_TYPES.Controller) private supplierAddressesController: RetailSupplierAddressesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "supplier-addresses": ["read"] }),
      zodValidate(supplierAddressesQuerySchema, "query"),
      this.supplierAddressesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "supplier-addresses": ["create"] }),
      zodValidate(supplierAddressesBodySchema, "body"),
      this.supplierAddressesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "supplier-addresses": ["read"] }),
      zodValidate(supplierAddressesIdParamsSchema, "params"),
      this.supplierAddressesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "supplier-addresses": ["update"] }),
      zodValidate(supplierAddressesIdParamsSchema, "params"),
      zodValidate(supplierAddressesBodySchema, "body"),
      this.supplierAddressesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "supplier-addresses": ["delete"] }),
      zodValidate(supplierAddressesIdParamsSchema, "params"),
      this.supplierAddressesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
