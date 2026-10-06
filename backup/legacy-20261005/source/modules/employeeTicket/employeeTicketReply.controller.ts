import { injectable, inject } from "inversify";
import { BaseController } from "@/shared/base/BaseController";
import { EmployeeTicketReplyService } from "./employeeTicketReply.service";
import { EMPLOYEE_TICKET_REPLY_TYPES } from "./employeeTicketReply.types";

@injectable()
export class EmployeeTicketReplyController extends BaseController<EmployeeTicketReplyService> {
  constructor(
    @inject(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyService)
    protected service: EmployeeTicketReplyService,
  ) {
    super(service);
  }
}
