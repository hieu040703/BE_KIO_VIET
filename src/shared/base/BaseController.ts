import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";

export interface ControllerServiceContract {
  findAllWithPagination(options: unknown, req?: Request): Promise<{ statusCode: number }>;
  findById(id: string, req?: Request): Promise<{ statusCode: number }>;
  create(data: unknown, req?: Request): Promise<{ statusCode: number }>;
  update(id: string, data: unknown, req?: Request): Promise<{ statusCode: number } | null>;
  delete(id: string, req?: Request): Promise<{ statusCode: number }>;
}

@injectable()
export abstract class BaseController<T extends ControllerServiceContract> {
  protected service: T;

  constructor(service: T) {
    this.service = service;
  }

  getAllWithPagination = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.findAllWithPagination(req.query, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return undefined;
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.findById(String(req.params.id), req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return undefined;
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.create(req.body, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return undefined;
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.update(String(req.params.id), req.body, req);
      if (!data) return res.status(404).json({ message: "Not Found" });
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return undefined;
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.delete(String(req.params.id), req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return undefined;
    }
  };
}
