import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { TicketReplyController } from "./ticketReply.controller";
import { TicketReplyService } from "./ticketReply.service";
import { TicketReplyRepository } from "./ticketReply.repository";
import { TicketReplyRouter } from "./ticketReply.route";
import { TICKET_REPLY_TYPES } from "./ticketReply.types";

const ticketReplyModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<TicketReplyService>(TICKET_REPLY_TYPES.TicketReplyService).to(TicketReplyService);
  options.bind<TicketReplyController>(TICKET_REPLY_TYPES.TicketReplyController).to(TicketReplyController);
  options.bind<TicketReplyRepository>(TICKET_REPLY_TYPES.TicketReplyRepository).to(TicketReplyRepository);
  options.bind<TicketReplyRouter>(TICKET_REPLY_TYPES.TicketReplyRouter).to(TicketReplyRouter);
});

export { ticketReplyModule };
