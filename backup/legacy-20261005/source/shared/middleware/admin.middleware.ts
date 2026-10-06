// middleware check if the user is an admin
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "@/shared/types/errors";
import { UserRoleEnum } from "@/shared/constants/constance";
import { RequestWithUser } from "../types/interfaces";
import { ErrorsMessages } from "../constants/errors";

export async function adminMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const userRole = user.role;

    if (userRole !== UserRoleEnum.ADMIN && userRole !== UserRoleEnum.MANAGER && userRole !== UserRoleEnum.EMPLOYEE) {
      throw new ForbiddenError(`role.${ErrorsMessages.forbidden}`);
    }

    next();
  } catch (error) {
    next(error);
  }
}
