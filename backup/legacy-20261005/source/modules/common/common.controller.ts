import { CodeService } from "./code.service";
import { COMMON_TYPES } from "./common.types";
import { inject, injectable } from "inversify";
import { CommonService } from "./common.service";
import { NextFunction, Response } from "express";
import { CodeType } from "@/shared/constants/constance";
import { GetDashboardStatsDto } from "./common.validator";
import { RequestWithUser } from "@/shared/types/interfaces";

@injectable()
export class CommonController {
  constructor(
    @inject(COMMON_TYPES.CommonService) private service: CommonService,
    @inject(COMMON_TYPES.CodeService) private codeService: CodeService,
  ) {}
  // Define your controller methods here
  getCode = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await this.codeService.getCode(req.query.type as CodeType);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  test = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      await this.service.test();
      return res.status(200).json({ message: "Test completed" });
    } catch (error) {
      next(error);
    }
  };

  getDashboardStats = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getDashboardStats(req.query as unknown as GetDashboardStatsDto, undefined);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  getHotline = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getHotline();
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

}
