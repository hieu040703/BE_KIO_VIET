import { Router } from "express";
import { inject, injectable } from "inversify";
import rateLimit from "express-rate-limit";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { GOONG_MAP_TYPES } from "./goongMap.types";
import { GoongMapController } from "./goongMap.controller";
import { GoongMapOrderParamsSchema } from "./goongMap.validator";

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
export class ClientGoongMapRouter {
  private readonly router: Router;

  constructor(@inject(GOONG_MAP_TYPES.GoongMapController) private readonly controller: GoongMapController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/orders/:orderId/tracking",
      trackingLimiter,
      zodValidate(GoongMapOrderParamsSchema, "params"),
      this.controller.getOrderTracking,
    );

    this.router.get("/map-tile-key", this.controller.getMapTileKey);
  }

  public getRouter(): Router {
    return this.router;
  }
}
