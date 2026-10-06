import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { ApiResponse } from "@/shared/types/interfaces";
import { inject, injectable } from "inversify";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { header } from "./header";
import ExcelJS from "exceljs";
import dayjs from "dayjs";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class ImportOrderHandler {
  constructor(@inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager) {}

  async handle(filePath: string): Promise<ApiResponse<any>> {
    return await this.transactionManager.withTransaction(async (tx) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new BadRequestError("file.invalid");
      }

      // chunk data by 500 and create

      return ApiResponseHandler.createSuccess("OK", {});
    });
  }
}
