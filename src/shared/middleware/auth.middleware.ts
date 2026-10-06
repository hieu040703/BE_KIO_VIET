import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/shared/config/env";
import { UnauthorizedError } from "@/shared/types/errors";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    email: string | null;
    role: string;
  };
  tenantId?: string;
}

export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) throw new UnauthorizedError("Bearer access token is required");

    const payload = jwt.verify(header.slice("Bearer ".length).trim(), config.JWT_ACCESS_SECRET) as {
      sub: string;
      tenantId: string;
      email: string | null;
      role: string;
    };

    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.user = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      role: payload.role,
    };
    authenticatedRequest.tenantId = payload.tenantId;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
