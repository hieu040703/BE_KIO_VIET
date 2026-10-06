import { Router } from "express";
import { injectable, inject } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ZaloTemplateController } from "./zaloTemplate.controller";
import { ZALO_TEMPLATE_TYPES } from "./zaloTemplate.types";
import {
  CreateZaloTemplateSchema,
  UpdateZaloTemplateSchema,
  ZaloTemplateParamsSchema,
  ZaloTemplateQuerySchema,
} from "./zaloTemplate.validator";

@injectable()
export class AdminZaloTemplateRouter {
  private router: Router;

  constructor(
    @inject(ZALO_TEMPLATE_TYPES.ZaloTemplateController)
    private zaloTemplateController: ZaloTemplateController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", zodValidate(ZaloTemplateQuerySchema, "query"), this.zaloTemplateController.getAllWithPagination);
    this.router.post("/", zodValidate(CreateZaloTemplateSchema, "body"), this.zaloTemplateController.create);
    this.router.get("/:id", zodValidate(ZaloTemplateParamsSchema, "params"), this.zaloTemplateController.getById);
    this.router.put(
      "/:id",
      zodValidate(ZaloTemplateParamsSchema, "params"),
      zodValidate(UpdateZaloTemplateSchema, "body"),
      this.zaloTemplateController.update,
    );
    this.router.delete("/:id", zodValidate(ZaloTemplateParamsSchema, "params"), this.zaloTemplateController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
