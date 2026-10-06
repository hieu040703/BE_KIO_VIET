import { IHeader, ICustomizeCell, StyleError } from "@/shared/config/excels";
import { CellFormulaValue, DataValidation, Worksheet } from "exceljs";
import z from "zod";

const listFields = [
  "timeAt",
  "startAt",
  "endAt",
  "startDate",
  "endDate",
  "dob",
  "dateOfBirth",
  "issuedDate",
  "expirationDate",
  "contractStartDate",
  "contractEndDate",
  "joinDate",
  "leaveDate",
  "paymentDate",
  "birthDate",
  "warrantyStartDate",
  "warrantyEndDate",
  "dossierSaleStartAt",
  "dossierSaleEndAt",
  "depositStartAt",
  "depositEndAt",
  "startSampleDate",
  "endSampleDate",
  "startTestDate",
  "endTestDate",
  "signedAt",
  "createdAt",
];

export interface IRenderExcel {
  worksheet: Worksheet;
  headerData: IHeader[];
  startRow: number;
  startCol: number;
  dataCustomize?: any[] | [];
  dataRender?: any[] | [];
  dataFooter?: any[] | [];
  template?: boolean;
  numberRowTemplate?: number;
}

export interface IReadExcelResult {
  worksheet: Worksheet;
  headerData: IHeader[];
  startRow: number;
  startCol: number;
  startRowRead?: number;
  endRowRead?: number;
  dataCustomize?: ICustomizeCell[];
}

export interface iWriteZodErrorExcel {
  worksheet: Worksheet;
  headerData: IHeader[];
  startRow: number;
  startCol: number;
  dataErrors: z.core.$ZodIssue[];
  dataCheck: any[];
  startCheckIndex: number;
}

export class ExcelUtils {
  static getMaxDepth = (headers: any, currentDepth = 0) => {
    let maxDepth = currentDepth;
    for (const header of headers) {
      if (header.children && header.children.length > 0) {
        const childDepth = ExcelUtils.getMaxDepth(header.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    return maxDepth;
  };

  /**
   * Normalize string for comparison by removing invisible characters and extra whitespaces
   * @param value - The value to normalize
   * @returns Normalized string
   */
  static normalizeString = (value: any): string => {
    if (value === null || value === undefined) return "";

    let str = String(value).toLocaleLowerCase();

    // Unicode normalization - convert to NFD (canonical decomposition) then to NFC (canonical composition)
    // This handles cases where the same character can be represented in different forms
    try {
      // First normalize to NFD to decompose characters, then to NFC to compose them consistently
      str = str.normalize("NFD").normalize("NFC");
    } catch (e) {
      console.warn("Unicode normalization failed, proceeding without normalization:", e);
    }

    // Remove various types of whitespace and non-breaking spaces
    str = str.replace(/[\u00A0\u2000-\u200B\u2028\u2029\u3000]/g, " ");
    // Remove zero-width characters
    str = str.replace(/[\u200B-\u200D\uFEFF]/g, "");
    // Remove combining diacritical marks that might not have been properly composed
    // str = str.replace(/[\u0300-\u036f]/g, ""); // Uncomment if needed for extreme cases

    // Trim and replace multiple spaces with single space
    str = str.trim().replace(/\s+/g, " ");

    return str;
  };

  /**
   * Check if a number is a valid Excel date serial number
   * Excel stores dates as numbers (days since 1900-01-01)
   * Valid range is roughly 1 (1900-01-01) to 2958465 (9999-12-31)
   * @param value - The value to check
   * @returns true if the value is likely an Excel date serial number
   */
  static isExcelDateSerialNumber = (value: any): boolean => {
    if (typeof value !== "number") return false;
    // Excel date range: 1 (1900-01-01) to 2958465 (9999-12-31)
    // Also check if it's a reasonable number (not too small or too large)
    return value >= 1 && value <= 2958465;
  };

  /**
   * Convert Excel date serial number to JavaScript Date
   * Excel date system starts from 1900-01-01 (serial number 1)
   * Note: Excel incorrectly treats 1900 as a leap year, so we need to adjust
   * @param serial - Excel date serial number
   * @returns JavaScript Date object
   */
  static excelSerialToDate = (serial: number): Date => {
    // Excel's epoch is 1900-01-01, but JavaScript's Date is 1970-01-01
    // Also need to account for Excel's leap year bug (treats 1900 as leap year)
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899 (to account for Excel's bug)
    const days = Math.floor(serial);
    const milliseconds = Math.round((serial - days) * 86400 * 1000);

    const date = new Date(excelEpoch.getTime() + days * 86400 * 1000 + milliseconds);
    return date;
  };

  /**
   * Compare two strings with normalization for Excel header validation
   * @param value1 - First value to compare
   * @param value2 - Second value to compare
   * @returns true if strings are equal after normalization
   */
  static compareNormalizedStrings = (value1: any, value2: any): boolean => {
    const normalized1 = ExcelUtils.normalizeString(value1);
    const normalized2 = ExcelUtils.normalizeString(value2);

    // First try exact match after normalization
    if (normalized1 === normalized2) {
      return true;
    }

    // If exact match fails, try fuzzy Vietnamese comparison
    return ExcelUtils.fuzzyVietnameseCompare(normalized1, normalized2);
  };

  /**
   * Fuzzy comparison for Vietnamese text that handles various Unicode representations
   * @param str1 - First string to compare
   * @param str2 - Second string to compare
   * @returns true if strings are considered equal
   */
  static fuzzyVietnameseCompare = (str1: string, str2: string): boolean => {
    // Remove all diacritics for comparison
    const removeDiacritics = (str: string): string => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
        .normalize("NFC");
    };

    const clean1 = removeDiacritics(str1.toLowerCase());
    const clean2 = removeDiacritics(str2.toLowerCase());

    return clean1 === clean2;
  };

  /**
   * Analyze differences between two strings for debugging
   * @param value1 - First value to analyze
   * @param value2 - Second value to analyze
   * @returns Analysis object with detailed information
   */
  static analyzeStringDifferences = (value1: any, value2: any) => {
    const str1 = String(value1 || "");
    const str2 = String(value2 || "");
    const normalized1 = ExcelUtils.normalizeString(value1);
    const normalized2 = ExcelUtils.normalizeString(value2);

    // Additional Unicode analysis
    const nfd1 = str1.normalize("NFD");
    const nfd2 = str2.normalize("NFD");
    const nfc1 = str1.normalize("NFC");
    const nfc2 = str2.normalize("NFC");

    // Fuzzy comparison without diacritics
    const fuzzy1 = normalized1
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC");
    const fuzzy2 = normalized2
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC");

    return {
      original: { value1: str1, value2: str2 },
      normalized: { value1: normalized1, value2: normalized2 },
      unicode: {
        nfd1,
        nfd2,
        nfc1,
        nfc2,
        fuzzy1,
        fuzzy2,
      },
      lengths: {
        original1: str1.length,
        original2: str2.length,
        normalized1: normalized1.length,
        normalized2: normalized2.length,
        nfd1: nfd1.length,
        nfd2: nfd2.length,
      },
      charCodes: {
        original1: [...str1].map((c) => `${c}(${c.charCodeAt(0)})`),
        original2: [...str2].map((c) => `${c}(${c.charCodeAt(0)})`),
        normalized1: [...normalized1].map((c) => `${c}(${c.charCodeAt(0)})`),
        normalized2: [...normalized2].map((c) => `${c}(${c.charCodeAt(0)})`),
      },
      comparisons: {
        exactEqual: normalized1 === normalized2,
        fuzzyEqual: ExcelUtils.fuzzyVietnameseCompare(normalized1, normalized2),
        finalEqual: ExcelUtils.compareNormalizedStrings(value1, value2),
      },
      differences: ExcelUtils.findStringDifferences(normalized1, normalized2),
    };
  };

  /**
   * Find specific differences between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Array of differences
   */
  static findStringDifferences = (str1: string, str2: string) => {
    const differences = [];
    const maxLength = Math.max(str1.length, str2.length);

    for (let i = 0; i < maxLength; i++) {
      const char1 = str1[i] || "<missing>";
      const char2 = str2[i] || "<missing>";

      if (char1 !== char2) {
        differences.push({
          position: i,
          char1: char1,
          char2: char2,
          code1: char1 !== "<missing>" ? char1.charCodeAt(0) : null,
          code2: char2 !== "<missing>" ? char2.charCodeAt(0) : null,
        });
      }
    }

    return differences;
  };

  /**
   *
   * @param worksheet worksheet cần render
   * @param headerData dữ liệu header của excel
   * @param startRow dòng đầu tiên để render header
   * @param startCol cột đầu tiên để render header
   * @param dataCustomize dữ liệu để render custom cell phía trên header
   * @param dataRender dữ liệu để render vào các dòng dưới header
   * @param dataFooter dữ liệu để render footer
   * @param template tuỳ chọn để render ra file excel mẫu
   * @param numberRowTemplate số dòng render mẫu
   * @note nếu có customRowStyle trong dataRender thì sẽ áp dụng style đó cho toàn bộ dòng đó
   */
  static renderExcelHeader(input: IRenderExcel) {
    try {
      if (input.dataCustomize) {
        // to trang het cac o truoc header
        for (let i = 1; i < input.startRow; i++) {
          for (let j = 1; j <= input.headerData.length; j++) {
            input.worksheet.getCell(i, j).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFF" },
            };
          }
        }

        input.dataCustomize.forEach((item: ICustomizeCell) => {
          input.worksheet.getCell(item.cell).style = item.style;

          if (item.value) {
            input.worksheet.getCell(item.cell).value = item.value;
          }

          if (item.dataValidation) {
            input.worksheet.getCell(item.cell).dataValidation = item.dataValidation;
          }

          if (item.colSpan > 1) {
            // Cell sẽ có dạng "A1" hoặc "AB1" , cần tách chữ và số sau đó cộng thêm cột tương ứng với số tăng của colSpan
            const lastCell = `${String.fromCharCode(item.cell.charCodeAt(0) + item.colSpan)}${item.cell.match(/\d/g)}`;
            input.worksheet.mergeCells(item.cell, lastCell);
          }

          if (item.height) {
            const row = input.worksheet.getRow(parseInt(item.cell.match(/\d+/g)![0], 10));
            row.height = item.height;
          }
        });
      }

      const maxDepth = ExcelUtils.getMaxDepth(input.headerData) + 1; // +1 vì tính cả level đầu tiên

      // Hàm helper để đếm tổng số cột leaf (các cột không có children)
      const countLeafColumns = (headers: IHeader[]) => {
        let count = 0;
        for (const header of headers) {
          if (!header.children || header.children.length === 0) {
            count++;
          } else {
            count += countLeafColumns(header.children);
          }
        }
        return count;
      };

      // Hàm render header theo dạng đệ quy
      const renderHeaders = (headers: IHeader[], rowStart: number, colStart: number, currentDepth: number) => {
        let currentCol = colStart;
        headers.forEach((header: IHeader) => {
          input.worksheet.getRow(rowStart).height = 30;
          const cell = input.worksheet.getRow(rowStart).getCell(currentCol);
          cell.value = header.header;

          // Style cho cell default
          cell.style = {
            ...header.style,
            alignment: { vertical: "middle", horizontal: "center", wrapText: true },
          };

          if (header.children && header.children.length > 0) {
            // Có children -> merge cells theo chiều ngang
            const leafCount = countLeafColumns([header]);
            input.worksheet.mergeCells(rowStart, currentCol, rowStart, currentCol + leafCount - 1);

            // Render children
            currentCol = renderHeaders(header.children, rowStart + 1, currentCol, currentDepth + 1);
          } else {
            // Không có children -> set width và merge theo chiều dọc nếu cần
            input.worksheet.getColumn(currentCol).width = header.width;
            if (currentDepth < maxDepth - 1) {
              input.worksheet.mergeCells(rowStart, currentCol, rowStart + (maxDepth - currentDepth - 1), currentCol);
            }
            input.worksheet.getColumn(currentCol).key = header.key;
            currentCol++;
          }
        });

        return currentCol;
      };

      // Bắt đầu render
      renderHeaders(input.headerData, input.startRow, input.startCol, 0);

      // lấy ra mảng phẳng chứa các cột có children bằng 0
      const leafColumns: IHeader[] = [];

      const flattenHeaders = (headers: IHeader[]) => {
        headers.forEach((header: IHeader) => {
          if (header.children && header.children.length > 0) {
            flattenHeaders(header.children);
          } else {
            leafColumns.push(header);
          }
        });
      };
      flattenHeaders(input.headerData);

      // nếu template là true thì render template
      if (input.template && input.numberRowTemplate && input.numberRowTemplate > 0) {
        for (let i = 1; i <= input.numberRowTemplate; i++) {
          input.worksheet.getRow(input.startRow + maxDepth + i - 1).height = 25;
          // console.log("countLeafColumns:", countLeafColumns(headerData));
          for (let j = 1; j <= leafColumns.length; j++) {
            const cell = input.worksheet.getCell(input.startRow + maxDepth + i - 1, j);

            // áp dụng style từ header
            if ("styleData" in leafColumns[j - 1]) {
              const headerStyle = leafColumns[j - 1].styleData || {};

              cell.style = headerStyle;
            }

            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };

            if (leafColumns[j - 1].dataValidation) {
              cell.dataValidation = leafColumns[j - 1].dataValidation as DataValidation;
            }

            if (leafColumns[j - 1].dataType && leafColumns[j - 1].dataType === "list") {
              if (leafColumns[j - 1].dataTypeOptions && leafColumns[j - 1].dataTypeOptions.length > 0) {
                cell.dataValidation = {
                  type: "list",
                  allowBlank: true,
                  formulae: [`"${leafColumns[j - 1].dataTypeOptions.map((item: string) => item).join(",")}"`],
                };
              }

              if (leafColumns[j - 1].dataTypeFormulae) {
                cell.dataValidation = {
                  type: "list",
                  allowBlank: true,
                  formulae: [leafColumns[j - 1].dataTypeFormulae],
                };
              }
            }

            if (leafColumns[j - 1].dataType && leafColumns[j - 1].dataType === "textLength") {
              cell.dataValidation = {
                type: "textLength",
                allowBlank: true,
                formulae: [],
              };
            }

            if (leafColumns[j - 1].formula !== null && leafColumns[j - 1].formula !== undefined) {
              const formula = (leafColumns[j - 1].formula as string).replace(/\{i}/g, (i + input.startRow).toString());

              cell.value = formula;
            }
          }
        }
      }

      // nếu có dữ liệu thi render dữ liệu
      if (input.dataRender && input.dataRender.length > 0) {
        input.dataRender.forEach((data, index: number) => {
          const row = input.worksheet.getRow(input.startRow + maxDepth + index);
          row.height = 25;

          // chay qua cac cot tu trai qua phai
          for (let i = 1; i <= leafColumns.length; i++) {
            const cell = row.getCell(i);
            const headerStyle = leafColumns[i - 1].style || {};

            if (data[leafColumns[i - 1].key] !== undefined) {
              cell.value = data[leafColumns[i - 1].key];
            } else {
              cell.value = null;
            }

            if (headerStyle.numFmt) {
              cell.numFmt = headerStyle.numFmt as string;
            }

            if (headerStyle.alignment) {
              cell.alignment = {
                ...cell.alignment,
                ...headerStyle.alignment,
              };
            }

            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };

            if (leafColumns[i - 1].formula !== null && leafColumns[i - 1].formula !== undefined) {
              const formula = (leafColumns[i - 1].formula as string).replace(
                /\{i}/g,
                (index + input.startRow + maxDepth).toString(),
              );

              cell.value = formula;
            }

            if (data.errorData && Array.isArray(data.errorData) && data.errorData.length > 0) {
              for (const errorItem of data.errorData) {
                if (errorItem.field === leafColumns[i - 1].key) {
                  cell.style = data.errorData.style || StyleError;
                  cell.note = errorItem.message;
                }
              }
            }

            if (
              data.errorData &&
              typeof data.errorData === "object" &&
              data.errorData.field === leafColumns[i - 1].key
            ) {
              cell.style = data.errorData.style || StyleError;
              if (data.errorData.message) {
                cell.note = data.errorData.message;
              }
            }

            if (data.customRowStyle) {
              cell.style = {
                ...cell.style,
                ...data.customRowStyle,
              };
            }
          }
        });

        // nếu có footer thi render footer
        if (input.dataFooter && input.dataFooter.length > 0) {
          // tìm dòng cuối cùng của dữ liệu
          const lastRow = input.startRow + maxDepth + input.dataRender.length;
          input.worksheet.getRow(lastRow).height = 20;

          for (let i = 1; i <= Object.keys(input.dataRender[0]).length; i++) {
            const cell = input.worksheet.getCell(lastRow, i);
            const footer = input.dataFooter.find((item: any) => item.col === i);
            if (footer !== undefined) {
              if (footer.colSpan > 1) {
                // Cell sẽ có dạng "A1" hoặc "AB1" , cần tách chữ và số sau đó cộng thêm cột tương ứng với số tăng của colSpan
                input.worksheet.mergeCells(lastRow, i, lastRow, i + footer.colSpan - 1);
              }

              cell.value = footer.value;
              cell.style = footer.style;
            } else {
              cell.style = {
                font: { bold: true, size: 14 },
                alignment: { vertical: "middle", horizontal: "center", wrapText: true },
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            }
          }
        }
      }

      return input.worksheet;
    } catch (error: any) {
      console.log("Error rendering Excel header:", error);
      throw new Error("Error rendering Excel header");
    }
  }

  /**
   *
   * @param worksheet worksheet cần đọc dữ liệu
   * @param headerData header của excel
   * @param startRow dòng bắt đầu đọc dữ liệu
   * @param startCol cột bắt đầu đọc dữ liệu
   * @param dataCustomize dữ liệu để đọc các ô tùy chỉnh
   * @returns { data: any[], dataCustomizeCell: any }
   * - data: mảng dữ liệu đọc được từ excel
   * - dataCustomizeCell: đối tượng chứa các ô tùy chỉnh
   */
  static readExcelData = (input: IReadExcelResult): { data: any[]; dataCustomizeCell: any } => {
    try {
      const data: any[] = [];
      const dataCustomizeCell: any = {};

      const maxDeep = ExcelUtils.getMaxDepth(input.headerData) + 1; // +1 vì tính cả level đầu tiên

      // lấy ra mảng phẳng chứa các cột có children bằng 0
      const leafColumns: IHeader[] = [];

      const flattenHeaders = (headers: IHeader[]) => {
        headers.forEach((header: IHeader) => {
          if (header.children && header.children.length > 0) {
            flattenHeaders(header.children);
          } else {
            leafColumns.push(header);
          }
        });
      };
      flattenHeaders(input.headerData);

      const maxRow = input.worksheet.rowCount;
      const maxCol = input.startCol + leafColumns.length + 10; // +10 để đảm bảo lấy đủ cột trong trường hợp có cột ẩn

      if (!input.startRowRead && !input.endRowRead) {
        //? duyệt từng dòng dữ liệu, bắt đầu từ dòng sau header
        for (let i = input.startRow; i <= maxRow; i++) {
          const row = input.worksheet.getRow(i + maxDeep);
          const rowData: any = {};

          let shouldSkipRow = true;

          let count = input.startCol;
          for (count; count < maxCol; count++) {
            const cellStart = row.getCell(input.startCol + count);
            if (cellStart.value) {
              shouldSkipRow = false;
            } else if (cellStart.value && typeof cellStart.value === "object" && "result" in cellStart.value) {
              // Nếu là CellFormulaValue, kiểm tra result
              shouldSkipRow = !!(cellStart.value as CellFormulaValue).result;
            }

            if (!shouldSkipRow) {
              break;
            }
          }

          if (shouldSkipRow) {
            continue;
          }

          //? duyệt từng cột trong dòng
          for (let j = input.startCol; j <= maxCol; j++) {
            const cell = row.getCell(j);

            // clear cell style and note to default
            cell.style = {};
            if (cell.note) {
              (cell as any).note = undefined;
            }

            let key = "";

            //? tìm tên cột dựa vào vị trí cột hiện tại
            const headerName = input.worksheet.getCell(input.startRow + maxDeep - 1, j).value;

            if (headerName === null || headerName === undefined) {
              continue;
            }

            //? tìm xem tên cột có nằm trong danh sách header không
            const headerIndex = leafColumns.findIndex((h) => ExcelUtils.compareNormalizedStrings(h.header, headerName));

            //? nếu không tìm thấy, tự tạo key mới
            if (headerIndex === -1) {
              key = `unknown_${j}`;
            }

            //? nếu tìm thấy, lấy key từ danh sách header
            if (headerIndex !== -1) {
              key = leafColumns[headerIndex].key;
            }

            if (cell.value !== null && typeof cell.value === "object") {
              if (cell.value && typeof cell.value === "object" && "result" in cell.value) {
                //? nếu giá trị cell là công thức

                rowData[key] = (cell.value as CellFormulaValue).result;
              } else if (cell.value && typeof cell.value === "object" && "text" in cell.value) {
                //? nếu giá trị cell là đối tượng rich text
                rowData[key] = cell.value.text;
              } else if (cell.value && typeof cell.value === "object" && "richText" in cell.value) {
                //? nếu giá trị cell là đối tượng rich text
                rowData[key] = cell.value.richText.map((part: any) => part.text).join("");
              } else if (cell.value instanceof Date) {
                //? nếu giá trị cell là Date object
                rowData[key] = cell.value;
              } else {
                //? nếu giá trị cell có công thức nhưng không có result
                rowData[key] = cell.value ?? null;
              }
            } else if (
              typeof cell.value === "number" &&
              listFields.includes(key) &&
              ExcelUtils.isExcelDateSerialNumber(cell.value)
            ) {
              //? nếu giá trị cell là Excel date serial number, convert sang Date
              rowData[key] = ExcelUtils.excelSerialToDate(cell.value);
            } else {
              rowData[key] = cell.value ?? null;
            }

            if (typeof rowData[key] === "string") {
              rowData[key] = rowData[key].trim();
              if (rowData[key] === "") {
                rowData[key] = null;
              }
            }
          }

          data.push({
            ...rowData,
            rowNumber: i + maxDeep,
          });
        }
      } else if (input.startRowRead && input.endRowRead) {
        //? duyệt từng dòng dữ liệu, bắt đầu từ dòng sau header
        for (let i = input.startRowRead; i <= input.endRowRead; i++) {
          const row = input.worksheet.getRow(i + maxDeep);
          const rowData: any = {};

          const cellStart = row.getCell(input.startCol);

          let shouldSkipRow = false;

          if (!cellStart.value) {
            shouldSkipRow = true;
          } else if (typeof cellStart.value === "object" && "result" in cellStart.value) {
            // Nếu là CellFormulaValue, kiểm tra result
            shouldSkipRow = !(cellStart.value as CellFormulaValue).result;
          } else if (typeof cellStart.value === "object" && !("result" in cellStart.value)) {
            // Nếu là giá trị thường, kiểm tra truthy
            shouldSkipRow = true;
          } else {
            // Nếu là giá trị thường, kiểm tra truthy
            shouldSkipRow = false;
          }

          if (shouldSkipRow) {
            continue;
          }

          //? duyệt từng cột trong dòng
          for (let j = input.startCol; j <= maxCol; j++) {
            const cell = row.getCell(j);

            let key = "";

            //? tìm tên cột dựa vào vị trí cột hiện tại
            const headerName = input.worksheet.getCell(input.startRow + maxDeep - 1, j).value;

            //? tìm xem tên cột có nằm trong danh sách header không
            const headerIndex = leafColumns.findIndex((h) => ExcelUtils.compareNormalizedStrings(h.header, headerName));

            //? nếu không tìm thấy, tự tạo key mới
            if (headerIndex === -1) {
              key = `unknown_${j}`;
            }

            //? nếu tìm thấy, lấy key từ danh sách header
            if (headerIndex !== -1) {
              key = leafColumns[headerIndex].key;
            }

            if (cell.value !== null && typeof cell.value === "object") {
              if (cell.value && typeof cell.value === "object" && "result" in cell.value) {
                //? nếu giá trị cell là công thức

                rowData[key] = (cell.value as CellFormulaValue).result;
              } else if (cell.value && typeof cell.value === "object" && "text" in cell.value) {
                //? nếu giá trị cell là đối tượng rich text
                rowData[key] = cell.value.text;
              } else if (cell.value && cell.value instanceof Date) {
                //? nếu giá trị cell là Date object
                rowData[key] = cell.value;
              } else {
                //? nếu giá trị cell có công thức nhưng không có result
                rowData[key] = cell.value;
              }
            } else if (
              typeof cell.value === "number" &&
              listFields.includes(key) &&
              ExcelUtils.isExcelDateSerialNumber(cell.value)
            ) {
              //? nếu giá trị cell là Excel date serial number, convert sang Date
              console.log("cell excel serial date:", cell.value);
              rowData[key] = ExcelUtils.excelSerialToDate(cell.value);
            } else {
              rowData[key] = cell.value;
            }

            if (typeof rowData[key] === "string") {
              rowData[key] = rowData[key].trim();
              if (rowData[key] === "") {
                rowData[key] = null;
              }
            }
          }

          data.push({
            ...rowData,
            rowNumber: i + maxDeep,
          });
        }
      }

      if (input.dataCustomize && input.dataCustomize.length > 0) {
        input.dataCustomize.forEach((item: ICustomizeCell) => {
          const cell = input.worksheet.getCell(item.cell);

          if (cell.value !== null) {
            if (typeof cell.value === "object" && "result" in cell.value) {
              dataCustomizeCell[item.key] = (cell.value as CellFormulaValue).result;
            } else if (cell.value instanceof Date) {
              //? nếu giá trị cell là Date object
              dataCustomizeCell[item.key] = cell.value;
            } else if (ExcelUtils.isExcelDateSerialNumber(cell.value) && listFields.includes(item.key)) {
              //? nếu giá trị cell là Excel date serial number, convert sang Date
              dataCustomizeCell[item.key] = ExcelUtils.excelSerialToDate(cell.value as number);
            } else {
              dataCustomizeCell[item.key] = cell.value;
            }
          }
        });
      }

      return { data, dataCustomizeCell };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  /**
   * Phuơng thức ghi lỗi từ zod vào file excel
   * @param input
   * @returns
   */
  static writeZodErrorsToExcel(input: iWriteZodErrorExcel) {
    const maxDeep = ExcelUtils.getMaxDepth(input.headerData) + 1; // +1 vì tính cả level đầu tiên

    for (const error of input.dataErrors) {
      console.log("error:", error);
    }

    // lấy ra mảng phẳng chứa các cột có children bằng 0
    const leafColumns: IHeader[] = [];

    const flattenHeaders = (headers: IHeader[]) => {
      headers.forEach((header: IHeader) => {
        if (header.children && header.children.length > 0) {
          flattenHeaders(header.children);
        } else {
          leafColumns.push(header);
        }
      });
    };
    flattenHeaders(input.headerData);

    const maxRow = input.worksheet.rowCount;
    const maxCol = input.startCol + leafColumns.length - 1;

    for (const error of input.dataErrors) {
      // Tính vị trí dòng lỗi
      const rowNumber = input.startRow + maxDeep + input.startCheckIndex + (error.path[0] as number);

      //? search column including key match error.path[1]
      const column = leafColumns.find((h) => h.key === error.path[1]);
      if (column === undefined) continue; // Nếu không tìm thấy cột, bỏ qua

      //? tìm tên cột dựa vào vị trí cột hiện tại
      let colNumber = 1;
      for (let j = input.startCol; j <= maxCol; j++) {
        const cellHeader = input.worksheet.getCell(input.startRow + maxDeep - 1, j).value;
        if (ExcelUtils.compareNormalizedStrings(cellHeader, column.header)) {
          // Tính vị trí cột lỗi
          colNumber = j;
          break;
        }
      }

      // Lấy ô cần ghi lỗi
      const cell = input.worksheet.getCell(rowNumber, colNumber);

      // Áp dụng style lỗi
      cell.style = StyleError;
      cell.note = error.message;
    }
  }

  //? phương thức so sánh % giống nhau của header file excel với header mẫu
  static validateHeaderSimilarity(input: IReadExcelResult): { same: boolean; headerMissed: string[] } {
    let same = true;

    // lấy ra mảng phẳng chứa các cột có children bằng 0
    const leafColumns: IHeader[] = [];

    const flattenHeaders = (headers: IHeader[]) => {
      headers.forEach((header: IHeader) => {
        if (header.children && header.children.length > 0) {
          flattenHeaders(header.children);
        } else {
          leafColumns.push(header);
        }
      });
    };
    flattenHeaders(input.headerData);

    //? lấy tất cả các cột bắt buộc => có required = true
    const requiredHeaders = leafColumns.filter((h) => h.required === true);

    //? lấy tất cả các cột header trong file excel
    const excelHeaders: string[] = [];
    const maxDeep = ExcelUtils.getMaxDepth(input.headerData) + 1; // +1 vì tính cả level đầu tiên
    const maxCol = input.startCol + leafColumns.length - 1;

    for (let j = input.startCol; j <= maxCol; j++) {
      const cellHeader = input.worksheet.getCell(input.startRow + maxDeep - 1, j).value;
      if (cellHeader && typeof cellHeader === "string") {
        excelHeaders.push(cellHeader);
      }
    }

    const headerMissed: string[] = [];

    //? so sánh từng header bắt buộc với header trong file excel
    for (const requiredHeader of requiredHeaders) {
      const found = excelHeaders.find((h) => ExcelUtils.compareNormalizedStrings(h, requiredHeader.header));
      if (!found) {
        same = false;
        headerMissed.push(requiredHeader.header);
      }
    }

    console.log("headerMissed", headerMissed);

    return {
      same,
      headerMissed,
    };
  }

  //? phương thức so sánh % giống nhau của header file excel với header mẫu
  static compareHeaderSimilarity(input: IReadExcelResult): number {
    let same = 0;
    for (let i = 0; i < input.headerData.length; i++) {
      const excelHeaderValue = input.worksheet.getCell(input.startRow, i + input.startCol).value;
      const templateHeaderValue = input.headerData[i].header;

      if (!ExcelUtils.compareNormalizedStrings(excelHeaderValue, templateHeaderValue)) {
        continue;
      } else {
        same++;
        // console.log(`✓ Tiêu đề cột ${i} khớp!`);
      }
    }
    return (same / input.headerData.length) * 100;
  }
}
