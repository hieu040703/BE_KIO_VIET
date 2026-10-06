import { inject, injectable } from "inversify";
import { Router } from "express";
import { SSE_TYPES } from "./sse.types";
import { SSEController } from "./sse.controller";
import { SSEService } from "./sse.service";
import { Request, Response } from "express";
import { Utils } from "@/shared/utils/utils";

@injectable()
export class ClientSSERouter {
  private router: Router;
  constructor(
    @inject(SSE_TYPES.SSEController) private controller: SSEController,
    @inject(SSE_TYPES.SSEService) private sseService: SSEService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Add middleware to disable buffering for SSE routes
    this.router.use((req, res, next) => {
      // Disable any response buffering for SSE
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    });
    this.router.get("/clients", this.controller.getClient); // New endpoint to get clients info
    this.router.post("/broadcast", this.controller.demoBroadcast);
    this.router.get("/stream", this.controller.priceStream); // Use new method
    this.router.get("/test", this.controller.testSSE); // Simple test endpoint
  }

  public getRouter(): Router {
    return this.router;
  }
}
