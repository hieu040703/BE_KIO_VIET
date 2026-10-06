import { Router } from "express";
import { inject, injectable } from "inversify";
import rateLimit from "express-rate-limit";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { GoogleMapController } from "./googleMap.controller";
import { GOOGLE_MAP_TYPES } from "./googleMap.types";
import { GoogleMapOrderParamsSchema, UpdateManagerLocationSchema } from "./googleMap.validator";

const managerLocationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Quá nhiều yêu cầu cập nhật vị trí, vui lòng thử lại sau",
  },
});

@injectable()
export class GoogleMapRouter {
  private readonly router: Router;

  constructor(@inject(GOOGLE_MAP_TYPES.GoogleMapController) private readonly controller: GoogleMapController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      "/orders/:orderId/location",
      managerLocationLimiter,
      zodValidate(GoogleMapOrderParamsSchema, "params"),
      zodValidate(UpdateManagerLocationSchema, "body"),
      this.controller.updateManagerLocation,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
