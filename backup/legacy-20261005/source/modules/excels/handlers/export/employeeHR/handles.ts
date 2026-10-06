import dayjs from "dayjs";
import Excel from "exceljs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { inject, injectable } from "inversify";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { header } from "./header";
import { ExcelUtils } from "@/shared/utils/excel/excels.utils";
import { Request } from "express";
import { DataEmployeeHrDto } from "./validate";
import { ExportEmployeeHrDto } from "@/modules/excels/excels.validator";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { Not } from "typeorm";
import { EmployeeSelectBasic } from "@/modules/employee/employee.select";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class ExportEmployeeHrHandler {
  constructor(@inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository) {}

  async handle(data: ExportEmployeeHrDto, req?: Request, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Dữ liệu tuyển dụng nhân sự");

    let dataRender: DataEmployeeHrDto[] = [];

    const employees = await this.employeeRepository.findByOptions(
      {
        where: {
          code: Not("NV-0001"),
        },
        select: {
          ...EmployeeSelectBasic,
          branch: {
            name: true,
          },
        },
        relations: {
          branch: true,
        },
      },

      manager,
    );

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      let recruitmentQuantity = 0;

      if (data.startAt && data.endAt) {
        for (const emp of employees) {
          if (
            emp.recruiterId === employee.id &&
            emp.startDate &&
            (dayjs(emp.startDate).isAfter(dayjs(data.startAt)) || dayjs(emp.startDate).isSame(dayjs(data.startAt))) &&
            (dayjs(emp.startDate).isBefore(dayjs(data.endAt)) || dayjs(emp.startDate).isSame(dayjs(data.endAt)))
          ) {
            recruitmentQuantity++;
          }
        }
      } else {
        recruitmentQuantity = employees.filter((e) => e.recruiterId === employee.id).length;
      }

      dataRender.push({
        index: i + 1,
        employeeName: employee.name,
        employeeCode: employee.code,
        branchName: employee.branch ? employee.branch.name : null,
        recruitmentQuantity: recruitmentQuantity,
      });
    }

    worksheet.mergeCells("A2", "G2");
    worksheet.getRow(2).height = 40;
    worksheet.getCell("A2").value = `BÁO CÁO TUYỂN DỤNG NHÂN SỰ`;
    worksheet.getCell("A2").font = { size: 18, bold: true };
    worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

    if (data.startAt && data.endAt) {
      worksheet.getCell("A3").value = `Ngày:`;
      worksheet.getCell("A3").font = { size: 12, bold: false };
      worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "right" };

      worksheet.mergeCells("B3", "F3");
      worksheet.getCell("B3").value =
        `${dayjs(data.startAt).format("DD/MM/YYYY")} - ${dayjs(data.endAt).format("DD/MM/YYYY")}`;
      worksheet.getCell("B3").font = { size: 12, bold: false };
      worksheet.getCell("B3").alignment = { vertical: "middle", horizontal: "left" };
    }

    ExcelUtils.renderExcelHeader({
      worksheet,
      headerData: header,
      startRow: 4,
      startCol: 1,
      dataRender: dataRender,
    });

    const filePath = `uploads/temp/Bao-Cao-Tuyen-Dung-Nhan-Su-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    return ApiResponseHandler.createSuccess("OK", { path: filePath });
  }
}
