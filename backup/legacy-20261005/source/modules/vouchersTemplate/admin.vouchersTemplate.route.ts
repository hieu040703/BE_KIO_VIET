import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { AdminVouchersTemplateController } from "./admin.vouchersTemplate.controller";
import {
  CreateVouchersTemplateSchema,
  UpdateVouchersTemplateSchema,
  VouchersTemplateParamsSchema,
  VouchersTemplateQuerySchema,
} from "./vouchersTemplate.validator";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";

@injectable()
export class AdminVouchersTemplateRouter {
  private router: Router;

  constructor(
    @inject(VOUCHERS_TEMPLATE_TYPES.AdminVouchersTemplateController)
    private vouchersTemplateController: AdminVouchersTemplateController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      zodValidate(VouchersTemplateQuerySchema, "query"),
      this.vouchersTemplateController.getAllWithPagination,
    );
    this.router.post("/", zodValidate(CreateVouchersTemplateSchema, "body"), this.vouchersTemplateController.create);
    this.router.get(
      "/:id",
      zodValidate(VouchersTemplateParamsSchema, "params"),
      this.vouchersTemplateController.getById,
    );
    this.router.put(
      "/:id",
      zodValidate(VouchersTemplateParamsSchema, "params"),
      zodValidate(UpdateVouchersTemplateSchema, "body"),
      this.vouchersTemplateController.update,
    );
    this.router.delete(
      "/:id",
      zodValidate(VouchersTemplateParamsSchema, "params"),
      this.vouchersTemplateController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
