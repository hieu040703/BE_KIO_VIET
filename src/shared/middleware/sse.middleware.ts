import compression from "compression";
import { NextFunction, Request, Response } from "express";

export function sseMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.url.includes("/sse/") || req.headers.accept?.includes("text/event-stream")) {
    next();
    return;
  }

  compression()(req, res, next);
}
