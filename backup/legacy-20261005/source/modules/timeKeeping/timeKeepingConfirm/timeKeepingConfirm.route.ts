import { Router } from "express";
import { injectable, inject } from "inversify";
import { TimeKeepingConfirmController } from "./timeKeepingConfirm.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateTimeKeepingConfirmSchema,
  UpdateTimeKeepingConfirmSchema,
  TimeKeepingConfirmQuerySchema,
  TimeKeepingConfirmParamsSchema,
  ExportTimeSheetPdfSchema,
} from "./timeKeepingConfirm.validator";
import { TIME_KEEPING_CONFIRM_TYPES } from "./timeKeepingConfirm.types";

@injectable()
export class TimeKeepingConfirmRouter {
  private router: Router;

  constructor(
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmController)
    private timeKeepingConfirmController: TimeKeepingConfirmController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All timeKeepingConfirm routes require authentication
    // this.router.use(authenticate);

    // GET /timeKeepingConfirms - Get all timeKeepingConfirms with filters
    this.router.get(
      "/",
      zodValidate(TimeKeepingConfirmQuerySchema, "query"),
      this.timeKeepingConfirmController.getAllWithPagination,
    );

    // POST /timeKeepingConfirms/calculate - Calculate timeKeepingConfirm
    this.router.post("/calculate", this.timeKeepingConfirmController.calculateTimeKeepingConfirm);

    // POST /timeKeepingConfirms/export-pdf - Export timeKeepingConfirm PDFs
    this.router.post(
      "/export-pdf",
      zodValidate(ExportTimeSheetPdfSchema, "body"),
      this.timeKeepingConfirmController.exportTimeSheetPdf,
    );

    // POST /timeKeepingConfirms - Create new timeKeepingConfirm
    this.router.post(
      "/",
      zodValidate(CreateTimeKeepingConfirmSchema, "body"),
      this.timeKeepingConfirmController.create,
    );

    // GET /timeKeepingConfirms/:id - Get timeKeepingConfirm by ID
    this.router.get(
      "/:id",
      zodValidate(TimeKeepingConfirmParamsSchema, "params"),
      this.timeKeepingConfirmController.findByTKCId,
    );

    // PUT /timeKeepingConfirms/:id - Update timeKeepingConfirm
    this.router.put(
      "/:id",
      zodValidate(TimeKeepingConfirmParamsSchema, "params"),
      zodValidate(UpdateTimeKeepingConfirmSchema, "body"),
      this.timeKeepingConfirmController.updateHistory,
    );

    // DELETE /timeKeepingConfirms/:id - Delete timeKeepingConfirm
    this.router.delete(
      "/:id",
      zodValidate(TimeKeepingConfirmParamsSchema, "params"),
      this.timeKeepingConfirmController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
