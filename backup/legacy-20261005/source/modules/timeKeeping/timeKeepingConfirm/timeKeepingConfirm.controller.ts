import { injectable, inject } from "inversify";
import { TimeKeepingConfirmService } from "./timeKeepingConfirm.service";
import { TIME_KEEPING_CONFIRM_TYPES } from "./timeKeepingConfirm.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Response, Request } from "express";

@injectable()
export class TimeKeepingConfirmController extends BaseController<TimeKeepingConfirmService> {
  constructor(
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmService) protected service: TimeKeepingConfirmService,
  ) {
    super(service);
  }

  updateHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateHistory(req.params.id as string, req.body, req);

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  findByTKCId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = await this.service.findByTKCId(id, undefined, false, req);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  exportTimeSheetPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.exportTimeSheetPdf(req.body);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  calculateTimeKeepingConfirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.calculateTimeKeepingConfirm(req.body, req);
      return res.status(200).json({ message: "Tính toán chấm công thành công" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
}
