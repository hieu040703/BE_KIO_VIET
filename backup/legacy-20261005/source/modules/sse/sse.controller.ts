import { inject, injectable } from "inversify";
import { SSEService } from "./sse.service";
import { SSE_TYPES } from "./sse.types";
import { NextFunction, Response, Request } from "express";
import { Utils } from "@/shared/utils/utils";
import logger from "@/shared/utils/logger";

@injectable()
export class SSEController {
  constructor(@inject(SSE_TYPES.SSEService) private sseService: SSEService) {}

  getClient = (req: Request, res: Response) => {
    const count = this.sseService["clients"].size;
    const clients = Array.from(this.sseService["clients"].values()).map((client) => ({
      id: client.id,
      userId: client.userId,
      connectedAt: client.connectedAt,
    }));
    return res.status(200).json({ count, clients });
  };

  addClient = (req: Request, res: Response) => {
    const id = req.body.clientId as string;
    this.sseService.addClient(id, res);
    return res.status(200).json({ message: `Client ${id} connected` });
  };

  removeClient = (req: Request, res: Response) => {
    const clientId = req.query.clientId as string;
    this.sseService.removeClient(clientId);
    return res.status(200).json({ message: `Client ${clientId} disconnected` });
  };

  stopStreaming = (req: Request, res: Response) => {
    const clientId = req.query.clientId as string;
    this.sseService.removeClient(clientId);
    return res.status(200).json({ message: `Client ${clientId} disconnected` });
  };

  // 🔄 COMPLETELY REWRITTEN based on working implementation
  priceStream = (req: Request, res: Response) => {
    const clientId = Utils.generateRandomString(8);
    const userId = req.query.userId as string;

    logger.info(`🔗 New SSE client connecting: ${clientId}`);

    // Set SSE headers (exactly like working version)
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Send connection established event (exactly like working version)
    res.write(
      `event: connected\ndata: ${JSON.stringify({
        clientId,
        message: "Connected to price stream",
        timestamp: Date.now(),
      })}\n\n`,
    );

    // Add client to service
    this.sseService.addClient(clientId, res, userId);

    // Handle client disconnect (exactly like working version)
    req.on("close", () => {
      console.log(`❌ SSE client ${clientId} disconnected`);
      this.sseService.removeClient(clientId);
    });

    req.on("error", (error) => {
      console.error(`💥 SSE client ${clientId} error:`, error);
      this.sseService.removeClient(clientId);
    });
  };

  // Simple test endpoint without any complexity
  testSSE = (req: Request, res: Response) => {
    console.log("🧪 Simple SSE test endpoint");

    const clientId = Utils.generateRandomString(8);
    const userId = (req.query.userId as string) || "anonymous";

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    res.write(`data: {"message": "SSE Test Working!", "timestamp": ${Date.now()}}\n\n`);

    // Add to service
    this.sseService.addClient(clientId, res, userId);

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      res.write(`data: {"counter": ${counter}, "message": "Test message ${counter}", "timestamp": ${Date.now()}}\n\n`);

      if (counter >= 3) {
        clearInterval(interval);
        res.write(`data: {"message": "Test completed successfully!", "timestamp": ${Date.now()}}\n\n`);
      }
    }, 1000);

    req.on("close", () => {
      console.log("🧪 Simple SSE test client disconnected");
      clearInterval(interval);
    });
  };

  demoBroadcast = (req: Request, res: Response, next: NextFunction) => {
    console.log("🎯 Manual broadcast triggered");

    //? get clientId by userId
    const clientId = this.sseService.getClientIdByUserId("2");
    console.log("🎯 Broadcasting to clientId:", clientId);

    // Trigger manual price update
    this.sseService.broadcast("progress-update", {
      product: "TEST_COIN",
      price: Math.random() * 1000,
      change: Math.random() * 10 - 5,
      timestamp: Date.now(),
    });

    res.json({ message: "Broadcast sent to all clients" });
  };
}
