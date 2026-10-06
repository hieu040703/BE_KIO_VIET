import { Router } from "express";
import { injectable, inject } from "inversify";
import { TimeKeepingController } from "./timeKeeping.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateTimeKeepingSchema,
  UpdateTimeKeepingSchema,
  TimeKeepingQuerySchema,
  TimeKeepingParamsSchema,
  CreateTimeKeepingWithOrderSchema,
  ConfirmTimeKeepingSchema,
} from "./timeKeeping.validator";
import { TIME_KEEPING_TYPES } from "./timeKeeping.types";
import { TIME_KEEPING_CONFIRM_TYPES } from "./timeKeepingConfirm/timeKeepingConfirm.types";
import { TimeKeepingConfirmRouter } from "./timeKeepingConfirm/timeKeepingConfirm.route";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class TimeKeepingRouter {
  private router: Router;

  constructor(
    @inject(TIME_KEEPING_TYPES.TimeKeepingController) private timeKeepingController: TimeKeepingController,
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRouter)
    private timeKeepingConfirmRouter: TimeKeepingConfirmRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(
      "/histories",
      permissionMiddleware({ timekeeping: ["read"] }),
      this.timeKeepingConfirmRouter.getRouter(),
    );

    // GET /timeKeepings/all-summary - Get all timeKeepings summary by employee
    this.router.get(
      "/all-summary",
      permissionMiddleware({ timekeeping: ["read"] }),
      this.timeKeepingController.getAllTimeKeepingSummaryByEmployee,
    );

    //# GET /timeKeepings - Get all timeKeepings with filters
    this.router.get(
      "/",
      permissionMiddleware({ timekeeping: ["read"] }),
      zodValidate(TimeKeepingQuerySchema, "query"),
      this.timeKeepingController.getTimeKeepingByAllEmployeeAndDate,
    );

    // POST /timeKeepings/other
    this.router.post(
      "/other",
      permissionMiddleware({ timekeeping: ["create"] }),
      zodValidate(CreateTimeKeepingSchema, "body"),
      this.timeKeepingController.create,
    );

    // PUT /timeKeepings/other/:id
    this.router.put(
      "/other/:id",
      permissionMiddleware({ timekeeping: ["update"] }),
      zodValidate(TimeKeepingParamsSchema, "params"),
      zodValidate(UpdateTimeKeepingSchema, "body"),
      this.timeKeepingController.update,
    );

    // DELETE /timeKeepings/other/:id
    this.router.delete(
      "/other/:id",
      permissionMiddleware({ timekeeping: ["delete"] }),
      zodValidate(TimeKeepingParamsSchema, "params"),
      this.timeKeepingController.delete,
    );

    // POST /timeKeepings/confirm - xác nhận tạo phiếu chấm công cho nhân viên
    this.router.post(
      "/confirm",
      permissionMiddleware({ timekeeping: ["create"] }),
      zodValidate(ConfirmTimeKeepingSchema, "body"),
      this.timeKeepingController.confirmTimeKeeping,
    );

    // POST /timeKeepings - Create a new timeKeeping
    this.router.post(
      "/",
      permissionMiddleware({ timekeeping: ["create"] }),
      zodValidate(CreateTimeKeepingWithOrderSchema, "body"),
      this.timeKeepingController.createCustomTimeKeeping,
    );

    // GET /timeKeepings/:id - Get timeKeeping by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ timekeeping: ["read"] }),
      zodValidate(TimeKeepingParamsSchema, "params"),
      this.timeKeepingController.getById,
    );

    // PUT /timeKeepings/:id - Update timeKeeping
    this.router.put(
      "/:id",
      permissionMiddleware({ timekeeping: ["update"] }),
      zodValidate(TimeKeepingParamsSchema, "params"),
      zodValidate(UpdateTimeKeepingSchema, "body"),
      this.timeKeepingController.update,
    );

    // DELETE /timeKeepings/:id - Delete timeKeeping
    this.router.delete(
      "/:id",
      permissionMiddleware({ timekeeping: ["delete"] }),
      zodValidate(TimeKeepingParamsSchema, "params"),
      this.timeKeepingController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
