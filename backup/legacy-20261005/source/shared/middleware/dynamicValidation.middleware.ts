import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../types/errors";

type TypedSchemaMap<T extends string> = {
  [K in T]: ZodSchema<any>;
};

export const typedDynamicValidate = <T extends string>(schemaMap: TypedSchemaMap<T>, typeParam: string = "type") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const type = req.query[typeParam] as T;

      if (!type || !(type in schemaMap)) {
        next(new ValidationError(`input.invalid`));
      }

      const schema = schemaMap[type];
      const result = schema.parse(req.body);

      req.body = result;
      (req as any).type = type; // Attach type to request
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: any) => {
          return `${err.message}`;
        }) as string[];

        next(new ValidationError(`input.invalid`));
      } else {
        next(error);
      }
    }
  };
};
