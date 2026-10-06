import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAttendancesController } from "./attendances.controller";
import { RETAIL_ATTENDANCES_TYPES } from "./attendances.types";
import { attendancesBodySchema, attendancesIdParamsSchema, attendancesQuerySchema } from "./attendances.validator";

@injectable()
export class RetailAttendancesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ATTENDANCES_TYPES.Controller) private attendancesController: RetailAttendancesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "attendances": ["read"] }),
      zodValidate(attendancesQuerySchema, "query"),
      this.attendancesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "attendances": ["create"] }),
      zodValidate(attendancesBodySchema, "body"),
      this.attendancesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "attendances": ["read"] }),
      zodValidate(attendancesIdParamsSchema, "params"),
      this.attendancesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "attendances": ["update"] }),
      zodValidate(attendancesIdParamsSchema, "params"),
      zodValidate(attendancesBodySchema, "body"),
      this.attendancesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "attendances": ["delete"] }),
      zodValidate(attendancesIdParamsSchema, "params"),
      this.attendancesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
