import { IHeader, ListStyle } from "@/shared/config/excels";
import { Column, DataValidation } from "exceljs";

export const header: IHeader[] = [
  {
    header: "Số thứ tự",
    key: "index",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Tên nhân sự",
    key: "employeeName",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Mã nhân sự",
    key: "employeeCode",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Zalo",
    key: "zaloName",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Chi nhánh",
    key: "branchName",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Số lượng đã tuyển",
    key: "recruitmentQuantity",
    width: 25,
    style: {
      ...(ListStyle.YELLOW as Partial<Column>),
      numFmt: "##0",
      alignment: { horizontal: "right" },
    },
    children: [],
  },
];
