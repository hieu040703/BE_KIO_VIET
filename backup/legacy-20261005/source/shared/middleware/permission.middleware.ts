import { PermissionGroup, PermissionModule, PermissionStructure } from "@/database/models/PermissionGroup";
import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../types/interfaces";
import { ForbiddenError, NotFoundError } from "../types/errors";
import DatabaseConfig from "@/database/database";
import { User } from "@/database/models/User";
import { Permission } from "@/database/models/PermissionGroup";

type PermissionResolver =
  | PermissionStructure
  | ((req: RequestWithUser) => PermissionStructure);

export const permissionMiddleware = (module: PermissionResolver) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new NotFoundError("Bạn không có quyền truy cập");
      const user = await DatabaseConfig.getRepository(User).findOneBy({ id: userId });
      if (!user) throw new NotFoundError("Bạn không có quyền truy cập");

      req.user!.permissionAdvance = false;
      req.user!.viewAll = false;

      if (user.role === "ADMIN") {
        req.user!.permissionAdvance = true;
        req.user!.viewAll = true;
        return next();
      }

      const permission = await DatabaseConfig.getRepository(PermissionGroup).findOneBy({
        id: user.permissionGroupId!,
      });
      if (!permission) throw new NotFoundError("Bạn không có quyền truy cập");
      const requiredPermissions = typeof module === "function" ? module(req) : module;
      const key = Object.keys(requiredPermissions)[0] as PermissionModule;
      const value = requiredPermissions[key] ?? ([] as Permission[]);
      const checkPermission = permission.permissions[key]?.some((item) => item === value[0]);
      if (!checkPermission) throw new ForbiddenError("Bạn không có quyền thao tác này");

      if (permission.permissions[key]!.includes("advance")) {
        req.user!.permissionAdvance = true;
      }

      if (permission.permissions[key]!.includes("readAll")) {
        req.user!.viewAll = true;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
