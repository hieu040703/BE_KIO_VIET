import { Router } from "express";
import { inject, injectable } from "inversify";
import rateLimit from "express-rate-limit";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { GOONG_MAP_TYPES } from "./goongMap.types";
import { GoongMapController } from "./goongMap.controller";
import {
  AutocompleteQuerySchema,
  PlaceChildrenQuerySchema,
  PlaceDetailQuerySchema,
  ForwardGeocodeQuerySchema,
  ReverseGeocodeQuerySchema,
  GeocodeStreetQuerySchema,
  DirectionsQuerySchema,
  DistanceMatrixQuerySchema,
  TripQuerySchema,
} from "./goongMap.validator";

const goongRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Quá nhiều yêu cầu bản đồ, vui lòng thử lại sau",
  },
});

@injectable()
export class GoongMapRouter {
  private readonly router: Router;

  constructor(@inject(GOONG_MAP_TYPES.GoongMapController) private readonly controller: GoongMapController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // 1. Autocomplete V2
    this.router.get(
      "/autocomplete",
      goongRateLimiter,
      zodValidate(AutocompleteQuerySchema, "query"),
      this.controller.autocomplete,
    );

    // 2. Place Children (Child ID) V2
    this.router.get(
      "/place-children",
      goongRateLimiter,
      zodValidate(PlaceChildrenQuerySchema, "query"),
      this.controller.placeChildren,
    );

    // 3. Place Detail V2
    this.router.get(
      "/place-detail",
      goongRateLimiter,
      zodValidate(PlaceDetailQuerySchema, "query"),
      this.controller.placeDetail,
    );

    // 4a. Geocode V2 – Forward (address → coords)
    this.router.get(
      "/geocode",
      goongRateLimiter,
      zodValidate(ForwardGeocodeQuerySchema, "query"),
      this.controller.geocode,
    );

    // 4b. Geocode V2 – Reverse (latlng → address)
    this.router.get(
      "/reverse-geocode",
      goongRateLimiter,
      zodValidate(ReverseGeocodeQuerySchema, "query"),
      this.controller.reverseGeocode,
    );

    // 4c. Geocode Street V2 (latlng → street name)
    this.router.get(
      "/geocode-street",
      goongRateLimiter,
      zodValidate(GeocodeStreetQuerySchema, "query"),
      this.controller.geocodeStreet,
    );

    // 5. Directions V2
    this.router.get(
      "/directions",
      goongRateLimiter,
      zodValidate(DirectionsQuerySchema, "query"),
      this.controller.directions,
    );

    // 6. Distance Matrix V2
    this.router.get(
      "/distance-matrix",
      goongRateLimiter,
      zodValidate(DistanceMatrixQuerySchema, "query"),
      this.controller.distanceMatrix,
    );

    // 7. Trip V2
    this.router.get("/trip", goongRateLimiter, zodValidate(TripQuerySchema, "query"), this.controller.trip);
  }

  public getRouter(): Router {
    return this.router;
  }
}
