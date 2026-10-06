import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCommissionPoliciesController } from "./commissionPolicies.controller";
import { RETAIL_COMMISSION_POLICIES_TYPES } from "./commissionPolicies.types";
import { commissionPoliciesBodySchema, commissionPoliciesIdParamsSchema, commissionPoliciesQuerySchema } from "./commissionPolicies.validator";

@injectable()
export class RetailCommissionPoliciesRouter {
  private router: Router;

  constructor(@inject(RETAIL_COMMISSION_POLICIES_TYPES.Controller) private commissionPoliciesController: RetailCommissionPoliciesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "commission-policies": ["read"] }),
      zodValidate(commissionPoliciesQuerySchema, "query"),
      this.commissionPoliciesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "commission-policies": ["create"] }),
      zodValidate(commissionPoliciesBodySchema, "body"),
      this.commissionPoliciesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "commission-policies": ["read"] }),
      zodValidate(commissionPoliciesIdParamsSchema, "params"),
      this.commissionPoliciesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "commission-policies": ["update"] }),
      zodValidate(commissionPoliciesIdParamsSchema, "params"),
      zodValidate(commissionPoliciesBodySchema, "body"),
      this.commissionPoliciesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "commission-policies": ["delete"] }),
      zodValidate(commissionPoliciesIdParamsSchema, "params"),
      this.commissionPoliciesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
