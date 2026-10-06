import { Router } from "express";
import { injectable, inject } from "inversify";
import { FundController } from "./fund.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateFundSchema, UpdateFundSchema, FundQuerySchema, FundParamsSchema } from "./fund.validator";
import { FUND_TYPES } from "./fund.types";
import { authenticate } from "@/shared/middleware/auth.middleware";
import { adminMiddleware } from "@/shared/middleware/admin.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class FundRouter {
  private router: Router;

  constructor(@inject(FUND_TYPES.FundController) private fundController: FundController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All fund routes require authentication
    // POST /funds/sepay-webhook - Handle Sepay webhook
    this.router.post("/sepay-webhook", this.fundController.handleSepayWebhook);

    this.router.use(authenticate, adminMiddleware);
    // GET /funds - Get all funds with filters
    this.router.get(
      "/",
      permissionMiddleware({ fund: ["read"] }),
      zodValidate(FundQuerySchema, "query"),
      this.fundController.getAllWithPagination,
    );

    // POST /funds - Create new fund
    this.router.post(
      "/",
      permissionMiddleware({ fund: ["create"] }),
      zodValidate(CreateFundSchema, "body"),
      this.fundController.create,
    );

    // GET /funds/:id - Get fund by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ fund: ["read"] }),
      zodValidate(FundParamsSchema, "params"),
      this.fundController.getById,
    );

    // PUT /funds/:id - Update fund
    this.router.put(
      "/:id",
      permissionMiddleware({ fund: ["update"] }),
      zodValidate(FundParamsSchema, "params"),
      zodValidate(UpdateFundSchema, "body"),
      this.fundController.update,
    );

    // DELETE /funds/:id - Delete fund
    this.router.delete(
      "/:id",
      permissionMiddleware({ fund: ["delete"] }),
      zodValidate(FundParamsSchema, "params"),
      this.fundController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
