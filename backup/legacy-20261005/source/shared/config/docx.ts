import { TextRun, Paragraph, BorderStyle, Border, IBordersOptions } from "docx";

export const textRunCustom = (
  text: string,
  bold: boolean = false,
  italics: boolean = false,
  breakText: number | undefined = undefined,
  size: number = 26,
  color: string = "000000"
): TextRun => {
  return new TextRun({
    text: text,
    bold: bold,
    italics: italics,
    font: "Arial",
    size: size,
    break: breakText,
    color: color,
  });
};

export const textRunCustomManifest = (
  text: string,
  bold: boolean = false,
  italics: boolean = false,
  breakText: number | undefined = undefined,
  size: number = 22
): TextRun => {
  return new TextRun({
    text: text,
    bold: bold,
    italics: italics,
    font: "Arial",
    size: size,
    break: breakText,
  });
};

export const pageStyle = {
  margin: {
    top: 566.93 * 1.5, // 1.5 cm
    left: 566.93 * 2, // 2 cm
    right: 566.93 * 1.75, // 1.75 cm
    bottom: 566.93 * 1, // 1 cm
  },
};

export const pageStyleManifest = {
  margin: {
    top: 566.93 * 0.75, // 1.5 cm
    left: 566.93 * 2, // 2 cm
    right: 566.93 * 1.5, // 1.75 cm
    bottom: 566.93 * 0, // 1 cm
  },
};

export const textParagraphCustom = (
  text: TextRun,
  alignment:
    | "start"
    | "center"
    | "end"
    | "both"
    | "mediumKashida"
    | "distribute"
    | "numTab"
    | "highKashida"
    | "lowKashida"
    | "thaiDistribute"
    | "left"
    | "right"
    | undefined = "left",
  line: number = 360,
  border: IBordersOptions | undefined = undefined
): Paragraph => {
  return new Paragraph({
    children: [text],
    alignment: alignment,
    spacing: {
      line: line,
    },
    border: border,
  });
};

export const textParagraphCustomManifest = (
  text: TextRun,
  alignment:
    | "start"
    | "center"
    | "end"
    | "both"
    | "mediumKashida"
    | "distribute"
    | "numTab"
    | "highKashida"
    | "lowKashida"
    | "thaiDistribute"
    | "left"
    | "right"
    | undefined = "left",
  line: number = 312
): Paragraph => {
  return new Paragraph({
    children: [text],
    alignment: alignment,
    spacing: {
      line: line,
    },
  });
};

export const tableBorderNone = () => {
  return {
    top: {
      style: BorderStyle.NONE,
      color: "FF0000",
    },
    bottom: {
      style: BorderStyle.NONE,
      color: "FF0000",
    },
    left: {
      style: BorderStyle.NONE,
      color: "FF0000",
    },
    right: {
      style: BorderStyle.NONE,
      color: "FF0000",
    },
    insideHorizontal: { style: BorderStyle.NONE, color: "FF0000" },
    insideVertical: { style: BorderStyle.NONE, color: "FF0000" },
  };
};
