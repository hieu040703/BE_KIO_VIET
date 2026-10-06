import { Router } from "express";
import { inject, injectable } from "inversify";
import rateLimit from "express-rate-limit";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { GoogleMapController } from "./googleMap.controller";
import { GOOGLE_MAP_TYPES } from "./googleMap.types";
import { GoogleMapOrderParamsSchema } from "./googleMap.validator";

const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Quá nhiều yêu cầu theo dõi vị trí, vui lòng thử lại sau",
  },
});

@injectable()
export class ClientGoogleMapRouter {
  private readonly router: Router;

  constructor(@inject(GOOGLE_MAP_TYPES.GoogleMapController) private readonly controller: GoogleMapController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/orders/:orderId/tracking",
      trackingLimiter,
      zodValidate(GoogleMapOrderParamsSchema, "params"),
      this.controller.getOrderTracking,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
