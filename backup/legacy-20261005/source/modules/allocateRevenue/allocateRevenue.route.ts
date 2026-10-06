import { Router } from "express";
import { injectable, inject } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { ALLOCATE_REVENUE_TYPES } from "./allocateRevenue.types";
import { AllocateRevenueController } from "./allocateRevenue.controller";
import {
  AllocateRevenueParamsSchema,
  AllocateRevenueQuerySchema,
  AllocateRevenueToEmployeesSchema,
  CreateAllocateRevenueRecordSchema,
  CreateAllocateRevenueSchema,
  UpdateAllocateRevenueSchema,
} from "./allocateRevenue.validator";

@injectable()
export class AllocateRevenueRouter {
  private router: Router;

  constructor(
    @inject(ALLOCATE_REVENUE_TYPES.AllocateRevenueController)
    private allocateRevenueController: AllocateRevenueController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/revenue",
      permissionMiddleware({ order: ["read"] }),
      zodValidate(AllocateRevenueToEmployeesSchema, "query"),
      this.allocateRevenueController.calculateTotalRevenue,
    );

    this.router.post(
      "/allocate-revenue",
      zodValidate(CreateAllocateRevenueRecordSchema, "body"),
      this.allocateRevenueController.allocateRevenueToEmployees,
    );

    this.router.get("/", zodValidate(AllocateRevenueQuerySchema, "query"), this.allocateRevenueController.getAllWithPagination);

    this.router.post("/", zodValidate(CreateAllocateRevenueSchema, "body"), this.allocateRevenueController.create);

    this.router.get("/:id", zodValidate(AllocateRevenueParamsSchema, "params"), this.allocateRevenueController.getById);

    this.router.get(
      "/:id/order-leaders",
      permissionMiddleware({ allocateRevenue: ["read"] }),
      zodValidate(AllocateRevenueParamsSchema, "params"),
      this.allocateRevenueController.getOrderLeaders,
    );

    this.router.put(
      "/:id",
      zodValidate(AllocateRevenueParamsSchema, "params"),
      zodValidate(UpdateAllocateRevenueSchema, "body"),
      this.allocateRevenueController.update,
    );

    this.router.delete(
      "/:id",
      permissionMiddleware({ allocateRevenue: ["delete"] }),
      zodValidate(AllocateRevenueParamsSchema, "params"),
      this.allocateRevenueController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
