import { Ticket } from "@/database/models/Ticket";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const TicketSelectBasic: FindOptionsSelect<Ticket> = {
  id: true,
  customerId: true,
  serviceOrderId: true,
  type: true,
  priority: true,
  issue: true,
  description: true,
  contactPhone: true,
  preferredTime: true,
  status: true,
  note: true,
};

export const TicketSelectFull: FindOptionsSelect<Ticket> = {
  ...TicketSelectBasic,
};

export const TicketRelations: FindOptionsRelations<Ticket> = {};
