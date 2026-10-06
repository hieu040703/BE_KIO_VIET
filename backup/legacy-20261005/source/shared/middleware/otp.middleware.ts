import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/shared/types/errors";
import { JwtPayload, RequestWithUser } from "@/shared/types/interfaces";
import { config } from "../config/env";

export const otpMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const otpToken = (req as any).cookies?.otpToken;

    if (!otpToken) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else {
      const decoded = jwt.verify(otpToken, config.JWT_OTP_SECRET) as JwtPayload;
      (req as RequestWithUser).user = decoded;
      next();
    }
  } catch (error) {
    // Continue without user for optional auth
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
