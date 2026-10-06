import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAttendanceLogsController } from "./attendanceLogs.controller";
import { RETAIL_ATTENDANCE_LOGS_TYPES } from "./attendanceLogs.types";
import { attendanceLogsBodySchema, attendanceLogsIdParamsSchema, attendanceLogsQuerySchema } from "./attendanceLogs.validator";

@injectable()
export class RetailAttendanceLogsRouter {
  private router: Router;

  constructor(@inject(RETAIL_ATTENDANCE_LOGS_TYPES.Controller) private attendanceLogsController: RetailAttendanceLogsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "attendance-logs": ["read"] }),
      zodValidate(attendanceLogsQuerySchema, "query"),
      this.attendanceLogsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "attendance-logs": ["create"] }),
      zodValidate(attendanceLogsBodySchema, "body"),
      this.attendanceLogsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "attendance-logs": ["read"] }),
      zodValidate(attendanceLogsIdParamsSchema, "params"),
      this.attendanceLogsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "attendance-logs": ["update"] }),
      zodValidate(attendanceLogsIdParamsSchema, "params"),
      zodValidate(attendanceLogsBodySchema, "body"),
      this.attendanceLogsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "attendance-logs": ["delete"] }),
      zodValidate(attendanceLogsIdParamsSchema, "params"),
      this.attendanceLogsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
