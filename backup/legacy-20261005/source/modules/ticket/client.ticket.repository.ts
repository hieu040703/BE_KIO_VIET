import { BaseRepository } from "@/shared/base/BaseRepository";
import { Ticket } from "@/database/models/Ticket";
import { FindOptionsSelect } from "typeorm";
import { TicketSelectFull, TicketRelations } from "./ticket.select";
import { injectable, inject } from "inversify";

@injectable()
export class ClientTicketRepository extends BaseRepository<Ticket> {
  protected entityClass = Ticket;
  protected selectedFields = TicketSelectFull;
  protected relations = TicketRelations;
  protected multipleFile: boolean = true;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Ticket> | undefined): void {
    this.selectedFields = selectedFields || TicketSelectFull;
    this.relations = TicketRelations;
  }
}
