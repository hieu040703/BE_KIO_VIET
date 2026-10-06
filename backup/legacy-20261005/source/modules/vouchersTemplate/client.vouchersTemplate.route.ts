import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ClientVouchersTemplateController } from "./client.vouchersTemplate.controller";
import { VouchersTemplateParamsSchema, VouchersTemplateQuerySchema } from "./vouchersTemplate.validator";
import { VOUCHERS_TEMPLATE_TYPES } from "./vouchersTemplate.types";

@injectable()
export class ClientVouchersTemplateRouter {
  private router: Router;

  constructor(
    @inject(VOUCHERS_TEMPLATE_TYPES.ClientVouchersTemplateController)
    private vouchersTemplateController: ClientVouchersTemplateController,
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
    this.router.get(
      "/:id",
      zodValidate(VouchersTemplateParamsSchema, "params"),
      this.vouchersTemplateController.getById,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
