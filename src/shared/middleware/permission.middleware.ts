import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/shared/types/errors";
import { AuthenticatedRequest } from "./auth.middleware";

export type PermissionAction = "read" | "create" | "update" | "delete";
export type PermissionStructure = Record<string, PermissionAction[]>;

export const permissionMiddleware = (required: PermissionStructure) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authenticatedRequest = req as AuthenticatedRequest;
    if (!authenticatedRequest.user) {
      next(new UnauthorizedError("Authentication is required"));
      return;
    }

    if (authenticatedRequest.user.role === "ADMIN") {
      next();
      return;
    }

    next(new ForbiddenError(`Permission denied: ${Object.keys(required).join(", ")}`));
  };
};
