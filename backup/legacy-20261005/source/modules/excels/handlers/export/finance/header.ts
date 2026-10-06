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
    header: "Thời gian",
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
    header: "Số tiền",
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
    key: "note",
    width: 60,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Hạng mục",
    key: "category",
    width: 30,
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
    header: "Khách hàng",
    key: "customerName",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Số hợp đồng",
    key: "contractNumber",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
];
