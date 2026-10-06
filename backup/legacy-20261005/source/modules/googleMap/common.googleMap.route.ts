import { Router } from "express";
import { inject, injectable } from "inversify";
import rateLimit from "express-rate-limit";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { GoogleMapController } from "./googleMap.controller";
import { GOOGLE_MAP_TYPES } from "./googleMap.types";
import { GeocodeQuerySchema, ReverseGeocodeQuerySchema } from "./googleMap.validator";

const geocodingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Quá nhiều yêu cầu tra cứu bản đồ, vui lòng thử lại sau",
  },
});

@injectable()
export class CommonGoogleMapRouter {
  private readonly router: Router;

  constructor(@inject(GOOGLE_MAP_TYPES.GoogleMapController) private readonly controller: GoogleMapController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/geocode", geocodingLimiter, zodValidate(GeocodeQuerySchema, "query"), this.controller.geocode);
    this.router.get(
      "/reverse-geocode",
      geocodingLimiter,
      zodValidate(ReverseGeocodeQuerySchema, "query"),
      this.controller.reverseGeocode,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
