import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailDepartmentsController } from "./departments.controller";
import { RETAIL_DEPARTMENTS_TYPES } from "./departments.types";
import { departmentsBodySchema, departmentsIdParamsSchema, departmentsQuerySchema } from "./departments.validator";

@injectable()
export class RetailDepartmentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_DEPARTMENTS_TYPES.Controller) private departmentsController: RetailDepartmentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "departments": ["read"] }),
      zodValidate(departmentsQuerySchema, "query"),
      this.departmentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "departments": ["create"] }),
      zodValidate(departmentsBodySchema, "body"),
      this.departmentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "departments": ["read"] }),
      zodValidate(departmentsIdParamsSchema, "params"),
      this.departmentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "departments": ["update"] }),
      zodValidate(departmentsIdParamsSchema, "params"),
      zodValidate(departmentsBodySchema, "body"),
      this.departmentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "departments": ["delete"] }),
      zodValidate(departmentsIdParamsSchema, "params"),
      this.departmentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
