// middleware check if the user is an admin
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "@/shared/types/errors";
import { UserRoleEnum } from "@/shared/constants/constance";
import { ErrorsMessages } from "../constants/errors";

export async function clientMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const userRole = user.role;

    if (userRole !== UserRoleEnum.USER) {
      throw new ForbiddenError(`role.${ErrorsMessages.forbidden}`);
    }

    const customerId = user.customerId;
    if (!customerId) {
      throw new ForbiddenError("User does not have an associated customer ID");
    }

    next();
  } catch (error) {
    next(error);
  }
}
