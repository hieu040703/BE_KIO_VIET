import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSerialNumbersController } from "./serialNumbers.controller";
import { RETAIL_SERIAL_NUMBERS_TYPES } from "./serialNumbers.types";
import { serialNumbersBodySchema, serialNumbersIdParamsSchema, serialNumbersQuerySchema } from "./serialNumbers.validator";

@injectable()
export class RetailSerialNumbersRouter {
  private router: Router;

  constructor(@inject(RETAIL_SERIAL_NUMBERS_TYPES.Controller) private serialNumbersController: RetailSerialNumbersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "serial-numbers": ["read"] }),
      zodValidate(serialNumbersQuerySchema, "query"),
      this.serialNumbersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "serial-numbers": ["create"] }),
      zodValidate(serialNumbersBodySchema, "body"),
      this.serialNumbersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "serial-numbers": ["read"] }),
      zodValidate(serialNumbersIdParamsSchema, "params"),
      this.serialNumbersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "serial-numbers": ["update"] }),
      zodValidate(serialNumbersIdParamsSchema, "params"),
      zodValidate(serialNumbersBodySchema, "body"),
      this.serialNumbersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "serial-numbers": ["delete"] }),
      zodValidate(serialNumbersIdParamsSchema, "params"),
      this.serialNumbersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
