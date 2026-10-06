import { BaseRepository } from "@/shared/base/BaseRepository";
    import { TicketReply } from "@/database/models/TicketReply";
    import { FindOptionsSelect } from "typeorm";
    import { TicketReplySelectFull, TicketReplyRelations } from "./ticketReply.select";
    import { injectable, inject } from "inversify";

    @injectable()
    export class TicketReplyRepository extends BaseRepository<TicketReply> {
      protected entityClass = TicketReply;
      protected selectedFields = TicketReplySelectFull;
      protected relations = TicketReplyRelations;

      constructor() {
        super();
        this.setOptions();
      }

      setOptions(selectedFields?: FindOptionsSelect<TicketReply> | undefined): void {
        this.selectedFields = selectedFields || TicketReplySelectFull;
        this.relations = TicketReplyRelations;
      }
    }
    