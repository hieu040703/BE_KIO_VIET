import { Router } from "express";
import { injectable, inject } from "inversify";
import { OrderEmployeeController } from "./orderEmployee.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateOrderEmployeeSchema,
  UpdateOrderEmployeeSchema,
  OrderEmployeeQuerySchema,
  OrderEmployeeParamsSchema,
  UpdateOrderEmployeeMultiSchema,
} from "./orderEmployee.validator";
import { ORDER_EMPLOYEE_TYPES } from "./orderEmployee.types";

@injectable()
export class OrderEmployeeRouter {
  private router: Router;

  constructor(
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeController) private orderEmployeeController: OrderEmployeeController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /orderEmployees - Get all orderEmployees with filters
    this.router.get(
      "/",
      zodValidate(OrderEmployeeQuerySchema, "query"),
      this.orderEmployeeController.getAllWithPagination.bind(this.orderEmployeeController),
    );

    // POST /orderEmployees/:id/confirm-salary - Admin xác nhận mức lương
    this.router.post(
      "/:id/confirm-salary",
      zodValidate(OrderEmployeeParamsSchema, "params"),
      this.orderEmployeeController.confirmSalary.bind(this.orderEmployeeController),
    );

    // POST /orderEmployees - Create new orderEmployee
    this.router.post(
      "/",
      zodValidate(CreateOrderEmployeeSchema, "body"),
      this.orderEmployeeController.create.bind(this.orderEmployeeController),
    );

    // GET /orderEmployees/:id - Get orderEmployee by ID
    this.router.get(
      "/:id",
      zodValidate(OrderEmployeeParamsSchema, "params"),
      this.orderEmployeeController.getById.bind(this.orderEmployeeController),
    );

    // PUT /orderEmployees/update-many - Update multiple orderEmployees
    this.router.put(
      "/multi",
      zodValidate(UpdateOrderEmployeeMultiSchema, "body"),
      this.orderEmployeeController.updateManyData.bind(this.orderEmployeeController),
    );

    // PUT /orderEmployees/:id - Update orderEmployee
    this.router.put(
      "/:id",
      zodValidate(OrderEmployeeParamsSchema, "params"),
      zodValidate(UpdateOrderEmployeeSchema, "body"),
      this.orderEmployeeController.update.bind(this.orderEmployeeController),
    );

    // DELETE /orderEmployees/:id - Delete orderEmployee
    this.router.delete(
      "/:id",
      zodValidate(OrderEmployeeParamsSchema, "params"),
      this.orderEmployeeController.delete.bind(this.orderEmployeeController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
