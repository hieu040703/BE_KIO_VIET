import { injectable, inject } from "inversify";
    import { TicketReplyService } from "./ticketReply.service";
    import { TICKET_REPLY_TYPES } from "./ticketReply.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class TicketReplyController extends BaseController<TicketReplyService> {
      constructor(@inject(TICKET_REPLY_TYPES.TicketReplyService) protected service: TicketReplyService) {
        super(service);
      }
    }
    