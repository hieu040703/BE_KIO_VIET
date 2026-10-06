import { inject, injectable } from "inversify";
import { ExcelService } from "./excels.service";
import { NextFunction, Request, Response } from "express";
import { ExcelExportType, ExcelImportType, ExcelTemplateType, RequestWithUser } from "@/shared/types/interfaces";
import { EXCELS_TYPES } from "./excels.type";

@injectable()
export class ExcelController {
  constructor(@inject(EXCELS_TYPES.ExcelService) private service: ExcelService) { }

  exportTemplateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const numberOfRows = parseInt(req.query.numberOfRows as string) || 100000;
      const data = await this.service.createTemplateOrderFromExcel(numberOfRows);

      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
    }
  };

  importOrderExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const path = req.body.path;
      const data = await this.service.importOrdersFromExcel(path);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      next(error);
    }
  };

  importExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data;
      const filePath = req.body.path;
      const type = req.body.type as ExcelImportType;
      const requestWithUser = req as RequestWithUser;
      data = await this.service.importProfilesFromExcel(filePath);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  // EXPORT
  exportExpenseApprovalToExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const excelData = await this.service.exportExpenseApprovalToExcel(data, req);
      return res.status(excelData.statusCode).json(excelData);
    } catch (error) {
      next(error);
    }
  };

  exportCustomerDebtToExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const excelData = await this.service.exportCustomerDebtToExcel(req.body, req);
      return res.status(excelData.statusCode).json(excelData);
    } catch (error) {
      next(error);
    }
  };

  exportEmployeeHrToExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const excelData = await this.service.exportEmployeeHrToExcel(req.body, req);
      return res.status(excelData.statusCode).json(excelData);
    } catch (error) {
      next(error);
    }
  };

  exportFinanceToExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const excelData = await this.service.exportFinanceToExcel(req.body, req);
      return res.status(excelData.statusCode).json(excelData);
    } catch (error) {
      next(error);
    }
  };
}
