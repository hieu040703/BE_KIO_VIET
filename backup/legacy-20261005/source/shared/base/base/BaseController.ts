import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";

interface ControllerServiceContract {
  findAllWithPagination(options: unknown, req?: Request): Promise<{ statusCode: number }>;
  findById(id: string, req?: Request): Promise<{ statusCode: number }>;
  create(data: unknown, req?: Request): Promise<{ statusCode: number }>;
  update(id: string, data: unknown, req?: Request): Promise<{ statusCode: number } | null>;
  delete(id: string): Promise<{ statusCode: number }>;
}

interface UploadedFileLike {
  mimetype?: string;
  size?: number;
}

@injectable()
export abstract class BaseController<T extends ControllerServiceContract> {
  protected service: T;
  constructor(service: T) {
    this.service = service;
  }
  // ==================== CORE RESPONSE METHODS ==================== //
  getAllWithPagination = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.findAllWithPagination(req.query, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.findById(id, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const data = await this.service.create(req.body, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
      return;
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.update(id, req.body, req);
      if (!data) {
        return res.status(404).json({ message: "Not Found" });
      }
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
      return;
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
      const id = req.params.id as string;
      const data = await this.service.delete(id);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
      return;
    }
  };

  protected sendResponse(
    res: Response,
    data: unknown = null,
    message: string = "Success",
    statusCode: number = 200,
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  protected sendError(
    res: Response,
    message: string = "Error",
    statusCode: number = 500,
    errors: unknown = null,
  ): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle file upload validation
   */
  protected validateFileUpload(
    file: UploadedFileLike | undefined,
    allowedTypes: string[] = [],
    maxSize: number = 5 * 1024 * 1024,
  ): void {
    if (!file) {
      throw new Error("No file uploaded");
    }

    if (allowedTypes.length > 0 && (!file.mimetype || !allowedTypes.includes(file.mimetype))) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
    }

    if (typeof file.size === "number" && file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
  }

  /**
   * Log request for debugging
   */
  protected logRequest(req: Request, message: string = "Request received"): void {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${new Date().toISOString()}] ${message}`, {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
      });
    }
  }
}
