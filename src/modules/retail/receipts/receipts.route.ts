import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailReceiptsController } from "./receipts.controller";
import { RETAIL_RECEIPTS_TYPES } from "./receipts.types";
import { receiptsBodySchema, receiptsIdParamsSchema, receiptsQuerySchema } from "./receipts.validator";

@injectable()
export class RetailReceiptsRouter {
  private router: Router;

  constructor(@inject(RETAIL_RECEIPTS_TYPES.Controller) private receiptsController: RetailReceiptsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "receipts": ["read"] }),
      zodValidate(receiptsQuerySchema, "query"),
      this.receiptsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "receipts": ["create"] }),
      zodValidate(receiptsBodySchema, "body"),
      this.receiptsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "receipts": ["read"] }),
      zodValidate(receiptsIdParamsSchema, "params"),
      this.receiptsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "receipts": ["update"] }),
      zodValidate(receiptsIdParamsSchema, "params"),
      zodValidate(receiptsBodySchema, "body"),
      this.receiptsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "receipts": ["delete"] }),
      zodValidate(receiptsIdParamsSchema, "params"),
      this.receiptsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
