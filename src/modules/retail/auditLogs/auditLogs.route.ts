import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAuditLogsController } from "./auditLogs.controller";
import { RETAIL_AUDIT_LOGS_TYPES } from "./auditLogs.types";
import { auditLogsBodySchema, auditLogsIdParamsSchema, auditLogsQuerySchema } from "./auditLogs.validator";

@injectable()
export class RetailAuditLogsRouter {
  private router: Router;

  constructor(@inject(RETAIL_AUDIT_LOGS_TYPES.Controller) private auditLogsController: RetailAuditLogsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "audit-logs": ["read"] }),
      zodValidate(auditLogsQuerySchema, "query"),
      this.auditLogsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "audit-logs": ["create"] }),
      zodValidate(auditLogsBodySchema, "body"),
      this.auditLogsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "audit-logs": ["read"] }),
      zodValidate(auditLogsIdParamsSchema, "params"),
      this.auditLogsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "audit-logs": ["update"] }),
      zodValidate(auditLogsIdParamsSchema, "params"),
      zodValidate(auditLogsBodySchema, "body"),
      this.auditLogsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "audit-logs": ["delete"] }),
      zodValidate(auditLogsIdParamsSchema, "params"),
      this.auditLogsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
