import { Router } from "express";
import { injectable, inject } from "inversify";
import { TicketReplyController } from "./ticketReply.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateTicketReplySchema,
  UpdateTicketReplySchema,
  TicketReplyQuerySchema,
  TicketReplyParamsSchema,
} from "./ticketReply.validator";
import { TICKET_REPLY_TYPES } from "./ticketReply.types";

@injectable()
export class TicketReplyRouter {
  private router: Router;

  constructor(@inject(TICKET_REPLY_TYPES.TicketReplyController) private ticketReplyController: TicketReplyController) {
    this.router = Router({ mergeParams: true }); // mergeParams to access parent route params
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All ticketReply routes require authentication
    // this.router.use(authenticate);

    // GET /ticketReplys - Get all ticketReplys with filters
    this.router.get("/", zodValidate(TicketReplyQuerySchema, "query"), this.ticketReplyController.getAllWithPagination);

    // POST /ticketReplys - Create new ticketReply
    this.router.post("/", zodValidate(CreateTicketReplySchema, "body"), this.ticketReplyController.create);

    // GET /ticketReplys/:id - Get ticketReply by ID
    this.router.get("/:id", zodValidate(TicketReplyParamsSchema, "params"), this.ticketReplyController.getById);

    // PUT /ticketReplys/:id - Update ticketReply
    this.router.put(
      "/:id",
      zodValidate(TicketReplyParamsSchema, "params"),
      zodValidate(UpdateTicketReplySchema, "body"),
      this.ticketReplyController.update,
    );

    // DELETE /ticketReplys/:id - Delete ticketReply
    this.router.delete("/:id", zodValidate(TicketReplyParamsSchema, "params"), this.ticketReplyController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
