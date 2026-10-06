import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { ANNOUNCEMENT_TYPES } from "./announcement.types";
import { AnnouncementController } from "./announcement.controller";
import {
  AnnouncementParamsSchema,
  AnnouncementQuerySchema,
  CreateAnnouncementSchema,
  UpdateAnnouncementSchema,
} from "./announcement.validator";

@injectable()
export class AnnouncementRouter {
  private router: Router;

  constructor(@inject(ANNOUNCEMENT_TYPES.AnnouncementController) private controller: AnnouncementController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", zodValidate(AnnouncementQuerySchema, "query"), this.controller.getAllWithPagination);
    this.router.post("/", zodValidate(CreateAnnouncementSchema, "body"), this.controller.create);
    this.router.get("/:id", zodValidate(AnnouncementParamsSchema, "params"), this.controller.getById);
    this.router.put(
      "/:id",
      zodValidate(AnnouncementParamsSchema, "params"),
      zodValidate(UpdateAnnouncementSchema, "body"),
      this.controller.update,
    );
    this.router.delete("/:id", zodValidate(AnnouncementParamsSchema, "params"), this.controller.delete);
    this.router.post("/:id/send", zodValidate(AnnouncementParamsSchema, "params"), this.controller.send);
  }

  public getRouter(): Router {
    return this.router;
  }
}
