import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerNotesController } from "./customerNotes.controller";
import { RETAIL_CUSTOMER_NOTES_TYPES } from "./customerNotes.types";
import { customerNotesBodySchema, customerNotesIdParamsSchema, customerNotesQuerySchema } from "./customerNotes.validator";

@injectable()
export class RetailCustomerNotesRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_NOTES_TYPES.Controller) private customerNotesController: RetailCustomerNotesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-notes": ["read"] }),
      zodValidate(customerNotesQuerySchema, "query"),
      this.customerNotesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-notes": ["create"] }),
      zodValidate(customerNotesBodySchema, "body"),
      this.customerNotesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-notes": ["read"] }),
      zodValidate(customerNotesIdParamsSchema, "params"),
      this.customerNotesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-notes": ["update"] }),
      zodValidate(customerNotesIdParamsSchema, "params"),
      zodValidate(customerNotesBodySchema, "body"),
      this.customerNotesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-notes": ["delete"] }),
      zodValidate(customerNotesIdParamsSchema, "params"),
      this.customerNotesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
