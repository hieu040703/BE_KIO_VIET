import { Router } from "express";
import { injectable, inject } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { EmployeeTicketController } from "./employeeTicket.controller";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { EMPLOYEE_TICKET_REPLY_TYPES } from "./employeeTicketReply.types";
import { EmployeeTicketReplyRouter } from "./employeeTicketReply.route";
import {
  CreateEmployeeTicketSchema,
  EmployeeTicketParticipantQuerySchema,
  EmployeeTicketParamsSchema,
  EmployeeTicketQuerySchema,
  UpdateEmployeeTicketStatusSchema,
} from "./employeeTicket.validator";
import {
  employeeTicketAccessMiddleware,
  employeeTicketEmployeeMiddleware,
  employeeTicketManagerMiddleware,
  employeeTicketParticipantAdminMiddleware,
} from "./employeeTicket.middleware";
import { EmployeeTicketParticipantRouter } from "./employeeTicketParticipant.route";

@injectable()
export class EmployeeTicketRouter {
  private router: Router;

  constructor(
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketController)
    private employeeTicketController: EmployeeTicketController,
    @inject(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyRouter)
    private employeeTicketReplyRouter: EmployeeTicketReplyRouter,
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantRouter)
    private employeeTicketParticipantRouter: EmployeeTicketParticipantRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/participant-candidates",
      employeeTicketParticipantAdminMiddleware,
      zodValidate(EmployeeTicketParticipantQuerySchema, "query"),
      this.employeeTicketParticipantRouter.getCandidates,
    );

    this.router.use(
      "/:id/participants",
      zodValidate(EmployeeTicketParamsSchema, "params"),
      employeeTicketAccessMiddleware,
      this.employeeTicketParticipantRouter.getRouter(),
    );

    this.router.use(
      "/:ticketId/replies",
      employeeTicketAccessMiddleware,
      this.employeeTicketReplyRouter.getRouter(),
    );

    this.router.get(
      "/",
      employeeTicketAccessMiddleware,
      zodValidate(EmployeeTicketQuerySchema, "query"),
      this.employeeTicketController.getAllWithPagination,
    );
    this.router.post(
      "/",
      employeeTicketEmployeeMiddleware,
      zodValidate(CreateEmployeeTicketSchema, "body"),
      this.employeeTicketController.create,
    );
    this.router.get(
      "/:id",
      employeeTicketAccessMiddleware,
      zodValidate(EmployeeTicketParamsSchema, "params"),
      this.employeeTicketController.getById,
    );
    this.router.put(
      "/:id/status",
      employeeTicketManagerMiddleware,
      zodValidate(EmployeeTicketParamsSchema, "params"),
      zodValidate(UpdateEmployeeTicketStatusSchema, "body"),
      this.employeeTicketController.updateStatus,
    );
    this.router.post(
      "/:id/close",
      employeeTicketManagerMiddleware,
      zodValidate(EmployeeTicketParamsSchema, "params"),
      this.employeeTicketController.closeTicket,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
