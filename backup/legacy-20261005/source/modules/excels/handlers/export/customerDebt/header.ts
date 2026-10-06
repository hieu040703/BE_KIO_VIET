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
    header: "Số hợp đồng",
    key: "orderCode",
    width: 20,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Tăng",
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
    header: "Giảm",
    key: "payment",
    width: 15,
    style: {
      ...(ListStyle.YELLOW as Partial<Column>),
      numFmt: "#,##0",
      alignment: { horizontal: "right" },
    },
    children: [],
  },
  {
    header: "Còn nợ",
    key: "remainingDebt",
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
    key: "content",
    width: 40,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
  {
    header: "Địa chỉ",
    key: "address",
    width: 30,
    style: ListStyle.YELLOW as Partial<Column>,
    children: [],
  },
];
