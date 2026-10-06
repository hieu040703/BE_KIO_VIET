import { Router } from "express";
import { injectable, inject } from "inversify";
import { AdvanceSalaryController } from "./advanceSalary.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateAdvanceSalarySchema,
  UpdateAdvanceSalarySchema,
  AdvanceSalaryQuerySchema,
  AdvanceSalaryParamsSchema,
} from "./advanceSalary.validator";
import { ADVANCE_SALARY_TYPES } from "./advanceSalary.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class AdvanceSalaryRouter {
  private router: Router;

  constructor(
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryController) private advanceSalaryController: AdvanceSalaryController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All advanceSalary routes require authentication
    // this.router.use(authenticate);

    // GET /advanceSalarys - Get all advanceSalarys with filters
    this.router.get(
      "/",
      permissionMiddleware({ advanceSalary: ["read"] }),
      zodValidate(AdvanceSalaryQuerySchema, "query"),
      this.advanceSalaryController.getAllWithPagination,
    );

    // POST /advanceSalarys - Create new advanceSalary
    this.router.post(
      "/",
      permissionMiddleware({ advanceSalary: ["create"] }),
      zodValidate(CreateAdvanceSalarySchema, "body"),
      this.advanceSalaryController.create,
    );

    // GET /advanceSalarys/:id - Get advanceSalary by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ advanceSalary: ["read"] }),
      zodValidate(AdvanceSalaryParamsSchema, "params"),
      this.advanceSalaryController.getById,
    );

    // PUT /advanceSalarys/:id - Update advanceSalary
    this.router.put(
      "/:id",
      permissionMiddleware({ advanceSalary: ["update"] }),
      zodValidate(AdvanceSalaryParamsSchema, "params"),
      zodValidate(UpdateAdvanceSalarySchema, "body"),
      this.advanceSalaryController.update,
    );

    // DELETE /advanceSalarys/:id - Delete advanceSalary
    this.router.delete(
      "/:id",
      permissionMiddleware({ advanceSalary: ["delete"] }),
      zodValidate(AdvanceSalaryParamsSchema, "params"),
      this.advanceSalaryController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
