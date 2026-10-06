import { TicketReply } from "@/database/models/TicketReply";
    import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

    export const TicketReplySelectBasic: FindOptionsSelect<TicketReply> = {
        id: true,
  userId: true,
  ticketId: true,
  content: true,
  type: true,
  attachments: true,
  isInternal: true,
      note: true
    };

    export const TicketReplySelectFull: FindOptionsSelect<TicketReply> = {
      ...TicketReplySelectBasic,
    };

    export const TicketReplyRelations: FindOptionsRelations<TicketReply> = {
      
    };