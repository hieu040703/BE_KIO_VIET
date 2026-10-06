import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSalaryComponentsController } from "./salaryComponents.controller";
import { RETAIL_SALARY_COMPONENTS_TYPES } from "./salaryComponents.types";
import { salaryComponentsBodySchema, salaryComponentsIdParamsSchema, salaryComponentsQuerySchema } from "./salaryComponents.validator";

@injectable()
export class RetailSalaryComponentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SALARY_COMPONENTS_TYPES.Controller) private salaryComponentsController: RetailSalaryComponentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "salary-components": ["read"] }),
      zodValidate(salaryComponentsQuerySchema, "query"),
      this.salaryComponentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "salary-components": ["create"] }),
      zodValidate(salaryComponentsBodySchema, "body"),
      this.salaryComponentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "salary-components": ["read"] }),
      zodValidate(salaryComponentsIdParamsSchema, "params"),
      this.salaryComponentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "salary-components": ["update"] }),
      zodValidate(salaryComponentsIdParamsSchema, "params"),
      zodValidate(salaryComponentsBodySchema, "body"),
      this.salaryComponentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "salary-components": ["delete"] }),
      zodValidate(salaryComponentsIdParamsSchema, "params"),
      this.salaryComponentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
