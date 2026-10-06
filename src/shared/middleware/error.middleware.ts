import { NextFunction, Request, Response } from "express";
import { QueryFailedError } from "typeorm";
import { AppError } from "@/shared/types/errors";
import logger from "../utils/logger";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof QueryFailedError) {
    statusCode = 400;
    message = "Database query failed";
    logger.error("Database query failed", error.driverError);
  } else if (error && typeof error === "object" && "issues" in error) {
    statusCode = 400;
    message = "Validation Error";
    errors = (error as { issues: unknown }).issues;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({ statusCode, success: false, message, errors, timestamp: new Date().toISOString() });
}
