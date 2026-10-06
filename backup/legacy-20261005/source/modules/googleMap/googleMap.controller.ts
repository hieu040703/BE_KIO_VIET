import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { GOOGLE_MAP_TYPES } from "./googleMap.types";
import { GoogleMapService } from "./googleMap.service";

@injectable()
export class GoogleMapController {
  constructor(@inject(GOOGLE_MAP_TYPES.GoogleMapService) private readonly googleMapService: GoogleMapService) {}

  updateManagerLocation = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { orderId } = req.params as { orderId: string };
      const result = await this.googleMapService.updateManagerLocation(orderId, req.body, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  getOrderTracking = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { orderId } = req.params as { orderId: string };
      const result = await this.googleMapService.getOrderTracking(orderId, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  geocode = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.googleMapService.geocode(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  reverseGeocode = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.googleMapService.reverseGeocode(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
