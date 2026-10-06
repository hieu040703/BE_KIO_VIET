import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailBranchesController } from "./branches.controller";
import { RETAIL_BRANCHES_TYPES } from "./branches.types";
import { branchesBodySchema, branchesIdParamsSchema, branchesQuerySchema } from "./branches.validator";

@injectable()
export class RetailBranchesRouter {
  private router: Router;

  constructor(@inject(RETAIL_BRANCHES_TYPES.Controller) private branchesController: RetailBranchesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "branches": ["read"] }),
      zodValidate(branchesQuerySchema, "query"),
      this.branchesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "branches": ["create"] }),
      zodValidate(branchesBodySchema, "body"),
      this.branchesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "branches": ["read"] }),
      zodValidate(branchesIdParamsSchema, "params"),
      this.branchesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "branches": ["update"] }),
      zodValidate(branchesIdParamsSchema, "params"),
      zodValidate(branchesBodySchema, "body"),
      this.branchesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "branches": ["delete"] }),
      zodValidate(branchesIdParamsSchema, "params"),
      this.branchesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
