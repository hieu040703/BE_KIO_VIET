import { Router } from "express";
import { injectable, inject } from "inversify";
import { AdminTicketController } from "./admin.ticket.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import { CreateTicketSchema, UpdateTicketSchema, TicketQuerySchema, TicketParamsSchema } from "./ticket.validator";
import { TICKET_TYPES } from "./ticket.types";
import { TICKET_REPLY_TYPES } from "./ticketReply/ticketReply.types";
import { TicketReplyRouter } from "./ticketReply/ticketReply.route";

@injectable()
export class AdminTicketRouter {
  private router: Router;

  constructor(
    @inject(TICKET_TYPES.AdminTicketController) private ticketController: AdminTicketController,
    @inject(TICKET_REPLY_TYPES.TicketReplyRouter) private ticketReplyRouter: TicketReplyRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All ticket routes require authentication
    // this.router.use(authenticate);

    this.router.use("/:ticketId/replies", this.ticketReplyRouter.getRouter()); // Mount ticketReply router

    // GET /tickets - Get all tickets with filters
    this.router.get("/", zodValidate(TicketQuerySchema, "query"), this.ticketController.getAllWithPagination);

    // POST /tickets - Create new ticket
    this.router.post("/", zodValidate(CreateTicketSchema, "body"), this.ticketController.create);

    // GET /tickets/:id - Get ticket by ID
    this.router.get("/:id", zodValidate(TicketParamsSchema, "params"), this.ticketController.getById);

    // PUT /tickets/:id - Update ticket
    this.router.put(
      "/:id",
      zodValidate(TicketParamsSchema, "params"),
      zodValidate(UpdateTicketSchema, "body"),
      this.ticketController.update,
    );

    // POST /tickets/:id/close - Close ticket
    this.router.post("/:id/close", zodValidate(TicketParamsSchema, "params"), this.ticketController.closeTicket);

    // PUT /tickets/:id/status - Update ticket status
    this.router.put("/:id/status", zodValidate(TicketParamsSchema, "params"), this.ticketController.updateStatus);

    // DELETE /tickets/:id - Delete ticket
    this.router.delete("/:id", zodValidate(TicketParamsSchema, "params"), this.ticketController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
