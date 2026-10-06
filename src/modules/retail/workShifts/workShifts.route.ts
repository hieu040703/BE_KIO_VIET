import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailWorkShiftsController } from "./workShifts.controller";
import { RETAIL_WORK_SHIFTS_TYPES } from "./workShifts.types";
import { workShiftsBodySchema, workShiftsIdParamsSchema, workShiftsQuerySchema } from "./workShifts.validator";

@injectable()
export class RetailWorkShiftsRouter {
  private router: Router;

  constructor(@inject(RETAIL_WORK_SHIFTS_TYPES.Controller) private workShiftsController: RetailWorkShiftsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "work-shifts": ["read"] }),
      zodValidate(workShiftsQuerySchema, "query"),
      this.workShiftsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "work-shifts": ["create"] }),
      zodValidate(workShiftsBodySchema, "body"),
      this.workShiftsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "work-shifts": ["read"] }),
      zodValidate(workShiftsIdParamsSchema, "params"),
      this.workShiftsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "work-shifts": ["update"] }),
      zodValidate(workShiftsIdParamsSchema, "params"),
      zodValidate(workShiftsBodySchema, "body"),
      this.workShiftsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "work-shifts": ["delete"] }),
      zodValidate(workShiftsIdParamsSchema, "params"),
      this.workShiftsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
