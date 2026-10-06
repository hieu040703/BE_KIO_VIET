import Excel, { Borders, Column, Fill, Style, DataValidation } from "exceljs";

export const ListBorder: { [key: string]: Partial<Borders> } = {
  THIN: {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  },
};

const ListFill: { [key: string]: Fill } = {
  SOLID: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  },
  YELLOW: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  },
  BLUE: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "7FC0FD" },
  },
  BROWN: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "A52A2A" },
  },
  PINK: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFC0CB" },
  },
  WHITE: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFF" },
  },
};

type color = "SOLID" | "YELLOW" | "BLUE" | "BROWN" | "PINK" | "WHITE";

export const ListStyle: { [key in color]: Partial<Style> } = {
  SOLID: {
    font: { bold: true, size: 14 },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: ListBorder.THIN,
    fill: ListFill.SOLID,
    numFmt: "0",
    protection: { locked: false },
  },
  YELLOW: {
    font: { bold: true, size: 14 },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: ListBorder.THIN,
    fill: ListFill.YELLOW,
    numFmt: "0",
    protection: { locked: false },
  },
  BLUE: {
    font: { bold: true, size: 14 },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: ListBorder.THIN,
    fill: ListFill.BLUE,
    numFmt: "0",
    protection: { locked: false },
  },
  BROWN: {
    font: { bold: true, size: 14, color: { argb: "FFFFFF" } },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: ListBorder.THIN,
    fill: ListFill.BROWN,
    numFmt: "0",
    protection: { locked: false },
  },
  PINK: {
    font: { bold: true, size: 14 },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: ListBorder.THIN,
    fill: ListFill.PINK,
    numFmt: "0",
    protection: { locked: false },
  },
  WHITE: {
    font: { bold: true, size: 14 },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: ListBorder.THIN,
    fill: ListFill.WHITE,
    numFmt: "0",
    protection: { locked: false },
  },
};

export const StyleError: Partial<Excel.Style> = {
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0000" },
  },
  font: {
    color: { argb: "FFFFFF" },
    bold: true,
  },
  border: {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  },
  alignment: {
    vertical: "middle",
    horizontal: "center",
  },
};

export const StyleDuplicate: Partial<Excel.Style> = {
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F79736" },
  },
  font: {
    color: { argb: "000000" },
    bold: true,
  },
  border: {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  },
  alignment: {
    vertical: "middle",
    horizontal: "center",
  },
};

export interface IHeader {
  header: string;
  key: string;
  width: number;
  dataValidation?: DataValidation;
  formula?: string;
  dataType?: "list" | "whole" | "decimal" | "date" | "textLength" | "custom";
  dataTypeOptions?: any;
  dataTypeFormulae?: string;
  style?: Partial<Column>;
  styleData?: Partial<Column>;
  required?: boolean;
  children?: IHeader[] | [];
}

export interface ICustomizeCell {
  key: string;
  cell: string;
  value?: string | number;
  height?: number;
  col?: number;
  colSpan: number;
  dataValidation?: DataValidation;
  style: Partial<Column>;
}
