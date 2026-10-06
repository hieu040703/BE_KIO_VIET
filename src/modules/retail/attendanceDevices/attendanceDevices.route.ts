import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAttendanceDevicesController } from "./attendanceDevices.controller";
import { RETAIL_ATTENDANCE_DEVICES_TYPES } from "./attendanceDevices.types";
import { attendanceDevicesBodySchema, attendanceDevicesIdParamsSchema, attendanceDevicesQuerySchema } from "./attendanceDevices.validator";

@injectable()
export class RetailAttendanceDevicesRouter {
  private router: Router;

  constructor(@inject(RETAIL_ATTENDANCE_DEVICES_TYPES.Controller) private attendanceDevicesController: RetailAttendanceDevicesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "attendance-devices": ["read"] }),
      zodValidate(attendanceDevicesQuerySchema, "query"),
      this.attendanceDevicesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "attendance-devices": ["create"] }),
      zodValidate(attendanceDevicesBodySchema, "body"),
      this.attendanceDevicesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "attendance-devices": ["read"] }),
      zodValidate(attendanceDevicesIdParamsSchema, "params"),
      this.attendanceDevicesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "attendance-devices": ["update"] }),
      zodValidate(attendanceDevicesIdParamsSchema, "params"),
      zodValidate(attendanceDevicesBodySchema, "body"),
      this.attendanceDevicesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "attendance-devices": ["delete"] }),
      zodValidate(attendanceDevicesIdParamsSchema, "params"),
      this.attendanceDevicesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
