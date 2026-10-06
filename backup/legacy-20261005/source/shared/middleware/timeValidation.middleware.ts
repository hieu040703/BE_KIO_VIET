/**
 * Duyệt qua tất cả các trường được gửi từ body hoặc query của request nằm trong danh sách các trường thời gian.
 * Nếu có trường nào không hợp lệ (không phải ngày hợp lệ) thì trả về lỗi 400.
 * Hỗ trợ các định dạng: string, number (timestamp), Date
 * @param fields Danh sách các trường thời gian cần kiểm tra
 * @param location "body" hoặc "query", mặc định là "body"
 * @returns Middleware
 */
import { NextFunction, Request, Response } from "express";
import { TimeUtils } from "../utils/time.utils";

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
];

/**
 * Recursively validate time fields in an object
 * @param obj The object to validate
 * @param path Current path for error reporting
 * @param errorMessages Array to collect error messages
 */
const validateTimeFieldsRecursively = (obj: any, path: string = "", errorMessages: string[] = []): void => {
  if (!obj || typeof obj !== "object" || obj instanceof Date) {
    return;
  }

  for (const field of listFields) {
    if (field in obj) {
      const value = obj[field];
      const fieldPath = path ? `${path}.${field}` : field;

      let date: Date | null = null;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === "string" || typeof value === "number") {
        const timestamp = typeof value === "string" ? Date.parse(value) : value;
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        }
      } else {
        date = null;
      }

      // Update the original object with the parsed date
      obj[field] = date;

      if (!date || isNaN(date.getTime())) {
        errorMessages.push(`${fieldPath}.invalid`);
      }
    }
  }

  // Recursively check nested objects
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const nestedPath = path ? `${path}.${key}` : key;
      validateTimeFieldsRecursively(value, nestedPath, errorMessages);
    }
  }
};

export const timeValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body || {};
    const query = req.query || {};

    if (req.body || req.query) {
      const errorMessages: string[] = [];

      if ((body && Object.keys(body).length > 0) || (query && Object.keys(query).length > 0)) {
        // Validate body fields (including nested objects)
        if (body && Object.keys(body).length > 0) {
          validateTimeFieldsRecursively(body, "", errorMessages);
        }

        // Validate query fields (flat structure only)
        if (query && Object.keys(query).length > 0) {
          let updatedQuery: any = { ...query };

          for (const field of listFields) {
            if (field in query) {
              const value = query[field];

              let date: Date | null = null;

              if (value instanceof Date) {
                date = value;
              } else if (typeof value === "string" || typeof value === "number") {
                date = TimeUtils.getTime(value).toDate();
              }

              // Update the accumulated query object
              updatedQuery[field] = date;

              if (!date || isNaN(date.getTime())) {
                errorMessages.push(`${field}.invalid`);
              }
            }
          }

          // Apply all changes to req.query at once
          Object.defineProperty(req, "query", {
            value: updatedQuery,
            writable: true,
            configurable: true,
          });
        }
      }

      if (errorMessages.length > 0) {
        return res.status(400).json({
          message: "input.invalid",
          errors: errorMessages,
        });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
