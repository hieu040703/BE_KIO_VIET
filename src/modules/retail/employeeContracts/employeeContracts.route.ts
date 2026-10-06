import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeContractsController } from "./employeeContracts.controller";
import { RETAIL_EMPLOYEE_CONTRACTS_TYPES } from "./employeeContracts.types";
import { employeeContractsBodySchema, employeeContractsIdParamsSchema, employeeContractsQuerySchema } from "./employeeContracts.validator";

@injectable()
export class RetailEmployeeContractsRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Controller) private employeeContractsController: RetailEmployeeContractsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-contracts": ["read"] }),
      zodValidate(employeeContractsQuerySchema, "query"),
      this.employeeContractsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-contracts": ["create"] }),
      zodValidate(employeeContractsBodySchema, "body"),
      this.employeeContractsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-contracts": ["read"] }),
      zodValidate(employeeContractsIdParamsSchema, "params"),
      this.employeeContractsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-contracts": ["update"] }),
      zodValidate(employeeContractsIdParamsSchema, "params"),
      zodValidate(employeeContractsBodySchema, "body"),
      this.employeeContractsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-contracts": ["delete"] }),
      zodValidate(employeeContractsIdParamsSchema, "params"),
      this.employeeContractsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
