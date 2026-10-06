import { injectable, inject } from "inversify";
import { UserService } from "./user.service";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";
import { USER_TYPES } from "./user.types";
import { UserQueryDto } from "./user.validator";

@injectable()
export class UserController extends BaseController<UserService> {
  constructor(@inject(USER_TYPES.UserService) protected service: UserService) {
    super(service);
  }

  userAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id as string;
      const result = await this.service.activeUser(userId, req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id as string;
      const result = await this.service.resetPassword(userId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  createManage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const data = await this.service.createManager(req.body);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  updateManager = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id as string;
      const data = await this.service.updateManager(userId, req.body);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  hardDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id as string;
      const data = await this.service.hardDeleteUser(userId);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
