import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { EmployeeTicketReplyController } from "./employeeTicketReply.controller";
import { EmployeeTicketReplyRepository } from "./employeeTicketReply.repository";
import { EmployeeTicketReplyRouter } from "./employeeTicketReply.route";
import { EmployeeTicketReplyService } from "./employeeTicketReply.service";
import { EMPLOYEE_TICKET_REPLY_TYPES } from "./employeeTicketReply.types";

const employeeTicketReplyModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind<EmployeeTicketReplyService>(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyService)
    .to(EmployeeTicketReplyService);
  options
    .bind<EmployeeTicketReplyController>(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyController)
    .to(EmployeeTicketReplyController);
  options
    .bind<EmployeeTicketReplyRepository>(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyRepository)
    .to(EmployeeTicketReplyRepository);
  options
    .bind<EmployeeTicketReplyRouter>(EMPLOYEE_TICKET_REPLY_TYPES.EmployeeTicketReplyRouter)
    .to(EmployeeTicketReplyRouter);
});

export { employeeTicketReplyModule };
