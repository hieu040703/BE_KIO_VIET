import { injectable } from "inversify";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { EmployeeTicketReply } from "@/database/models/EmployeeTicketReply";
import { EmployeeTicketReplyRelations, EmployeeTicketReplySelectFull } from "./employeeTicketReply.select";

@injectable()
export class EmployeeTicketReplyRepository extends BaseRepository<EmployeeTicketReply> {
  protected entityClass = EmployeeTicketReply;
  protected selectedFields = EmployeeTicketReplySelectFull;
  protected relations = EmployeeTicketReplyRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(): void {
    this.selectedFields = EmployeeTicketReplySelectFull;
    this.relations = EmployeeTicketReplyRelations;
  }
}
