import { IHeader, ListStyle } from "@/shared/config/excels";
import { Column, DataValidation } from "exceljs";

export const header: IHeader[] = [
  {
    header: "Ngày",
    key: "timeAt",
    width: 15,
    style: {
      ...(ListStyle.YELLOW as Partial<Column>),
      numFmt: "dd/mm/yyyy",
    },
    children: [],
  },
  {
    header: "Số phiếu",
    key: "code",
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
    header: "Nhân viên",
    key: "employeeName",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Số tiền",
    key: "amount",
    width: 15,
    style: {
      ...(ListStyle.YELLOW as Partial<Column>),
      numFmt: "#,##0",
      alignment: { horizontal: "right" },
    },
    children: [],
  },
  {
    header: "Nội dung",
    key: "description",
    width: 50,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Loại",
    key: "type",
    width: 15,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
];
