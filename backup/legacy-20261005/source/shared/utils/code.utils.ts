import { Request, Response } from "express";
import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import { ValidationError } from "../types/errors";
import { User } from "@/database/models/User";
import { Attribute } from "@/database/models/Attribute";
import DatabaseConfig from "@/database/database";
import { ApiResponseHandler } from "./response.utils";

// Map entity class sang prefix + padding length
export const prefixMap = new Map<EntityTarget<ObjectLiteral>, { prefix: string; length: number }>([
  [User, { prefix: "EMP", length: 3 }],
  [Attribute, { prefix: "ATR", length: 3 }],
]);

export const getEntityByType = (type: string): EntityTarget<ObjectLiteral> | undefined => {
  return [...prefixMap.keys()].find((key) => {
    if (typeof key === "string") {
      return key.toLowerCase() === type.toLowerCase() || key.toLowerCase() + "s" === type.toLowerCase();
    }

    if (typeof key === "function" && "name" in key) {
      return key.name.toLowerCase() === type.toLowerCase() || key.name.toLowerCase() + "s" === type.toLowerCase();
    }

    return false;
  });
};

export const generateCode = async <T extends ObjectLiteral>(entity: EntityTarget<T>): Promise<string> => {
  const config = prefixMap.get(entity);
  if (!config) {
    throw new ValidationError("Entity configuration not found for code generation.");
  }

  const { prefix, length } = config;
  const repo = DatabaseConfig.getRepository(entity);

  const lastItem = await repo.createQueryBuilder("e").orderBy("e.id", "DESC").getOne();

  let number = 1;
  if (lastItem && "code" in lastItem && typeof lastItem.code === "string") {
    if (lastItem.code.startsWith(prefix)) {
      number = Number(lastItem.code.replace(prefix, "")) + 1;
    }
  }

  return `${prefix}${String(number).padStart(length, "0")}`;
};

export async function getCode(req: Request, res: Response) {
  try {
    const type = req.query.type as string;
    if (!type) {
      return res.status(400).json({
        message: "type.required",
        errors: ["type.required"],
      });
    }

    const entity = getEntityByType(type);
    if (!entity) {
      return res.status(400).json({
        message: "type.invalid",
        errors: ["type.invalid"],
      });
    }

    const code = await generateCode(entity);
    return ApiResponseHandler.getSuccess("OK", { code: code });
  } catch (error) {
    res.status(500).json({
      message: (error as any).message || "server.error",
      errors: (error as any).errors || [],
    });
  }
}
