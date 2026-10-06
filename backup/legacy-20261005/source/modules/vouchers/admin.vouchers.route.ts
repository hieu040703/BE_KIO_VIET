import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { AdminVouchersController } from "./admin.vouchers.controller";
import {
  CreateVouchersSchema,
  UpdateVouchersSchema,
  VouchersParamsSchema,
  VouchersQuerySchema,
} from "./vouchers.validator";
import { VOUCHERS_TYPES } from "./vouchers.types";

@injectable()
export class AdminVouchersRouter {
  private router: Router;

  constructor(
    @inject(VOUCHERS_TYPES.AdminVouchersController)
    private vouchersController: AdminVouchersController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", zodValidate(VouchersQuerySchema, "query"), this.vouchersController.getAllWithPagination);
    this.router.post("/", zodValidate(CreateVouchersSchema, "body"), this.vouchersController.create);
    this.router.get("/:id", zodValidate(VouchersParamsSchema, "params"), this.vouchersController.getById);
    this.router.put(
      "/:id",
      zodValidate(VouchersParamsSchema, "params"),
      zodValidate(UpdateVouchersSchema, "body"),
      this.vouchersController.update,
    );
    this.router.delete("/:id", zodValidate(VouchersParamsSchema, "params"), this.vouchersController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
