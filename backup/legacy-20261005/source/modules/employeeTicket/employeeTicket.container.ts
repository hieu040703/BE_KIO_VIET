import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { EmployeeTicketController } from "./employeeTicket.controller";
import { EmployeeTicketRepository } from "./employeeTicket.repository";
import { EmployeeTicketRouter } from "./employeeTicket.route";
import { EmployeeTicketService } from "./employeeTicket.service";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { EmployeeTicketParticipantService } from "./employeeTicketParticipant.service";
import { EmployeeTicketParticipantController } from "./employeeTicketParticipant.controller";
import { EmployeeTicketParticipantRepository } from "./employeeTicketParticipant.repository";
import { EmployeeTicketParticipantRouter } from "./employeeTicketParticipant.route";

const employeeTicketModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<EmployeeTicketService>(EMPLOYEE_TICKET_TYPES.EmployeeTicketService).to(EmployeeTicketService);
  options.bind<EmployeeTicketController>(EMPLOYEE_TICKET_TYPES.EmployeeTicketController).to(EmployeeTicketController);
  options.bind<EmployeeTicketRepository>(EMPLOYEE_TICKET_TYPES.EmployeeTicketRepository).to(EmployeeTicketRepository);
  options.bind<EmployeeTicketRouter>(EMPLOYEE_TICKET_TYPES.EmployeeTicketRouter).to(EmployeeTicketRouter);
  options
    .bind<EmployeeTicketParticipantService>(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantService)
    .to(EmployeeTicketParticipantService);
  options
    .bind<EmployeeTicketParticipantController>(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantController)
    .to(EmployeeTicketParticipantController);
  options
    .bind<EmployeeTicketParticipantRepository>(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantRepository)
    .to(EmployeeTicketParticipantRepository);
  options
    .bind<EmployeeTicketParticipantRouter>(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantRouter)
    .to(EmployeeTicketParticipantRouter);
});

export { employeeTicketModule };
