import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export type ValidationTarget = "body" | "query" | "params";

export function zodValidate(schema: z.ZodType, target: ValidationTarget) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }

    if (target === "query") {
      Object.assign(req.query, result.data);
    } else {
      (req as Request & Record<string, unknown>)[target] = result.data;
    }
    next();
  };
}
