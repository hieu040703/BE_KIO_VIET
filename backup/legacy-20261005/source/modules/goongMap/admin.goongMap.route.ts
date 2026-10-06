import { Router } from "express";
import { inject, injectable } from "inversify";
import rateLimit from "express-rate-limit";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { GOONG_MAP_TYPES } from "./goongMap.types";
import { GoongMapController } from "./goongMap.controller";
import {
  GoongMapOrderParamsSchema,
  ProcessingOrderMapQuerySchema,
  UpdateGoongManagerLocationSchema,
} from "./goongMap.validator";

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
export class AdminGoongMapRouter {
  private readonly router: Router;

  constructor(@inject(GOONG_MAP_TYPES.GoongMapController) private readonly controller: GoongMapController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/processing-orders",
      permissionMiddleware({ order: ["read"] }),
      zodValidate(ProcessingOrderMapQuerySchema, "query"),
      this.controller.getProcessingOrdersForMap,
    );

    this.router.post(
      "/orders/:orderId/location",
      managerLocationLimiter,
      zodValidate(GoongMapOrderParamsSchema, "params"),
      zodValidate(UpdateGoongManagerLocationSchema, "body"),
      this.controller.updateManagerLocation,
    );

    this.router.get("/map-tile-key", this.controller.getMapTileKey);
  }

  public getRouter(): Router {
    return this.router;
  }
}
