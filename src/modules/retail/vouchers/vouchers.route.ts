import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailVouchersController } from "./vouchers.controller";
import { RETAIL_VOUCHERS_TYPES } from "./vouchers.types";
import { vouchersBodySchema, vouchersIdParamsSchema, vouchersQuerySchema } from "./vouchers.validator";

@injectable()
export class RetailVouchersRouter {
  private router: Router;

  constructor(@inject(RETAIL_VOUCHERS_TYPES.Controller) private vouchersController: RetailVouchersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "vouchers": ["read"] }),
      zodValidate(vouchersQuerySchema, "query"),
      this.vouchersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "vouchers": ["create"] }),
      zodValidate(vouchersBodySchema, "body"),
      this.vouchersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "vouchers": ["read"] }),
      zodValidate(vouchersIdParamsSchema, "params"),
      this.vouchersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "vouchers": ["update"] }),
      zodValidate(vouchersIdParamsSchema, "params"),
      zodValidate(vouchersBodySchema, "body"),
      this.vouchersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "vouchers": ["delete"] }),
      zodValidate(vouchersIdParamsSchema, "params"),
      this.vouchersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
