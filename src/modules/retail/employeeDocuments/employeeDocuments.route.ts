import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeDocumentsController } from "./employeeDocuments.controller";
import { RETAIL_EMPLOYEE_DOCUMENTS_TYPES } from "./employeeDocuments.types";
import { employeeDocumentsBodySchema, employeeDocumentsIdParamsSchema, employeeDocumentsQuerySchema } from "./employeeDocuments.validator";

@injectable()
export class RetailEmployeeDocumentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Controller) private employeeDocumentsController: RetailEmployeeDocumentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-documents": ["read"] }),
      zodValidate(employeeDocumentsQuerySchema, "query"),
      this.employeeDocumentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-documents": ["create"] }),
      zodValidate(employeeDocumentsBodySchema, "body"),
      this.employeeDocumentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-documents": ["read"] }),
      zodValidate(employeeDocumentsIdParamsSchema, "params"),
      this.employeeDocumentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-documents": ["update"] }),
      zodValidate(employeeDocumentsIdParamsSchema, "params"),
      zodValidate(employeeDocumentsBodySchema, "body"),
      this.employeeDocumentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-documents": ["delete"] }),
      zodValidate(employeeDocumentsIdParamsSchema, "params"),
      this.employeeDocumentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
