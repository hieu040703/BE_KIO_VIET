import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { EmployeeTicketParticipantController } from "./employeeTicketParticipant.controller";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import {
  AddEmployeeTicketParticipantsSchema,
  EmployeeTicketParticipantUserParamsSchema,
} from "./employeeTicket.validator";

@injectable()
export class EmployeeTicketParticipantRouter {
  private router: Router;

  constructor(
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantController)
    private controller: EmployeeTicketParticipantController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.controller.getAll);
    this.router.post(
      "/",
      zodValidate(AddEmployeeTicketParticipantsSchema, "body"),
      this.controller.add,
    );
    this.router.delete(
      "/:userId",
      zodValidate(EmployeeTicketParticipantUserParamsSchema, "params"),
      this.controller.remove,
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  public getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.controller.getCandidates(req, res, next);
  }
}
