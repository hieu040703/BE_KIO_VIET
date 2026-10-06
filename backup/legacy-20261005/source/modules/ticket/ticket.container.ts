import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminTicketController } from "./admin.ticket.controller";
import { ClientTicketController } from "./client.ticket.controller";
import { AdminTicketService } from "./admin.ticket.service";
import { ClientTicketService } from "./client.ticket.service";
import { AdminTicketRepository } from "./admin.ticket.repository";
import { ClientTicketRepository } from "./client.ticket.repository";
import { AdminTicketRouter } from "./admin.ticket.route";
import { ClientTicketRouter } from "./client.ticket.route";
import { TICKET_TYPES } from "./ticket.types";

const ticketModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AdminTicketService>(TICKET_TYPES.AdminTicketService).to(AdminTicketService);
  options.bind<AdminTicketController>(TICKET_TYPES.AdminTicketController).to(AdminTicketController);
  options.bind<AdminTicketRouter>(TICKET_TYPES.AdminTicketRouter).to(AdminTicketRouter);
  options.bind<AdminTicketRepository>(TICKET_TYPES.AdminTicketRepository).to(AdminTicketRepository);

  options.bind<ClientTicketService>(TICKET_TYPES.ClientTicketService).to(ClientTicketService);
  options.bind<ClientTicketController>(TICKET_TYPES.ClientTicketController).to(ClientTicketController);
  options.bind<ClientTicketRouter>(TICKET_TYPES.ClientTicketRouter).to(ClientTicketRouter);
  options.bind<ClientTicketRepository>(TICKET_TYPES.ClientTicketRepository).to(ClientTicketRepository);
});

export { ticketModule };
