import { Router } from "express";
import { inject, injectable } from "inversify";
import { VOUCHERS_TYPES } from "./vouchers.types";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ClientVouchersController } from "./client.vouchers.controller";
import { RedeemVoucherSchema, VouchersParamsSchema, VouchersQuerySchema } from "./vouchers.validator";

@injectable()
export class ClientVouchersRouter {
  private router: Router;

  constructor(
    @inject(VOUCHERS_TYPES.ClientVouchersController)
    private vouchersController: ClientVouchersController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", zodValidate(VouchersQuerySchema, "query"), this.vouchersController.getAllWithPagination);
    this.router.post("/", zodValidate(RedeemVoucherSchema, "body"), this.vouchersController.create);
    this.router.get("/:id", zodValidate(VouchersParamsSchema, "params"), this.vouchersController.getById);
  }

  public getRouter(): Router {
    return this.router;
  }
}
