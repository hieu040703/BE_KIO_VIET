import { Router } from "express";
import { injectable, inject } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { EmployeeTicketReplyController } from "./employeeTicketReply.controller";
import { EMPLOYEE_TICKET_REPLY_TYPES } from "./employeeTicketReply.types";
import {
  CreateEmployeeTicketReplySchema,
  EmployeeTicketReplyQuerySchema,
} from "./employeeTicket.validator";

@injectable()
export class EmployeeTicketReplyRouter {
  private router: Router;

  constructor(
    @inject(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyController)
    private employeeTicketReplyController: EmployeeTicketReplyController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      zodValidate(EmployeeTicketReplyQuerySchema, "query"),
      this.employeeTicketReplyController.getAllWithPagination,
    );
    this.router.post(
      "/",
      zodValidate(CreateEmployeeTicketReplySchema, "body"),
      this.employeeTicketReplyController.create,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
