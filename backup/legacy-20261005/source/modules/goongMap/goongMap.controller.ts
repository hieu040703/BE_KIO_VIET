import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { GOONG_MAP_TYPES } from "./goongMap.types";
import { GoongMapService } from "./goongMap.service";

@injectable()
export class GoongMapController {
  constructor(@inject(GOONG_MAP_TYPES.GoongMapService) private readonly goongMapService: GoongMapService) {}

  autocomplete = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.autocomplete(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  placeChildren = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.placeChildren(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  placeDetail = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.placeDetail(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  geocode = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.geocode(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  reverseGeocode = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.reverseGeocode(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  geocodeStreet = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.geocodeStreet(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  directions = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.directions(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  distanceMatrix = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.distanceMatrix(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  trip = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.trip(req.query as any);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  updateManagerLocation = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { orderId } = req.params as { orderId: string };
      const result = await this.goongMapService.updateManagerLocation(orderId, req.body, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  getOrderTracking = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const { orderId } = req.params as { orderId: string };
      const result = await this.goongMapService.getOrderTracking(orderId, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  getProcessingOrdersForMap = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.getProcessingOrdersForMap(req.query as any, req);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };

  getMapTileKey = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const result = await this.goongMapService.getMapTileKey();
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
      return;
    }
  };
}
