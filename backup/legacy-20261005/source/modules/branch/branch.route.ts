import { Router } from "express";
import { injectable, inject } from "inversify";
import { BranchController } from "./branch.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateBranchSchema, UpdateBranchSchema, BranchQuerySchema, BranchParamsSchema } from "./branch.validator";
import { BRANCH_TYPES } from "./branch.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class BranchRouter {
  private router: Router;

  constructor(@inject(BRANCH_TYPES.BranchController) private branchController: BranchController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All branch routes require authentication
    // this.router.use(authenticate);

    // GET /branchs - Get all branchs with filters
    this.router.get(
      "/",
      permissionMiddleware({ branch: ["read"] }),
      zodValidate(BranchQuerySchema, "query"),
      this.branchController.getAllWithPagination,
    );

    // POST /branchs - Create new branch
    this.router.post(
      "/",
      permissionMiddleware({ branch: ["create"] }),
      zodValidate(CreateBranchSchema, "body"),
      this.branchController.create,
    );

    // GET /branchs/:id - Get branch by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ branch: ["read"] }),
      zodValidate(BranchParamsSchema, "params"),
      this.branchController.getById,
    );

    // PUT /branchs/:id - Update branch
    this.router.put(
      "/:id",
      permissionMiddleware({ branch: ["update"] }),
      zodValidate(BranchParamsSchema, "params"),
      zodValidate(UpdateBranchSchema, "body"),
      this.branchController.update,
    );

    // DELETE /branchs/:id - Delete branch
    this.router.delete(
      "/:id",
      permissionMiddleware({ branch: ["delete"] }),
      zodValidate(BranchParamsSchema, "params"),
      this.branchController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
