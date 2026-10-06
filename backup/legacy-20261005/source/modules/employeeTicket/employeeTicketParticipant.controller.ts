import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { EmployeeTicketParticipantService } from "./employeeTicketParticipant.service";
import { EMPLOYEE_TICKET_TYPES } from "./employeeTicket.types";
import { EmployeeTicketParticipantQueryDto } from "./employeeTicket.validator";

@injectable()
export class EmployeeTicketParticipantController {
  constructor(
    @inject(EMPLOYEE_TICKET_TYPES.EmployeeTicketParticipantService)
    private service: EmployeeTicketParticipantService,
  ) {}

  getCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.service.findCandidates(
        req.query as unknown as EmployeeTicketParticipantQueryDto,
        req,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.service.findByTicketId(req.params.id as string, req);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  add = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.service.add(
        req.params.id as string,
        req.body.userIds as string[],
        req,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = await this.service.remove(
        req.params.id as string,
        req.params.userId as string,
        req,
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };
}
