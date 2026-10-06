import { injectable } from "inversify";
import { SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { EmployeeTicket } from "@/database/models/EmployeeTicket";
import { IFindOptions } from "@/shared/types/interfaces";
import { EmployeeTicketRelations, EmployeeTicketSelectFull } from "./employeeTicket.select";
import { canReadEmployeeTickets } from "./employeeTicket.permissions";

@injectable()
export class EmployeeTicketRepository extends BaseRepository<EmployeeTicket> {
  protected entityClass = EmployeeTicket;
  protected selectedFields = EmployeeTicketSelectFull;
  protected relations = EmployeeTicketRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(): void {
    this.selectedFields = EmployeeTicketSelectFull;
    this.relations = EmployeeTicketRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<EmployeeTicket>,
    _options: IFindOptions<EmployeeTicket>,
    req?: import("express").Request,
  ): Promise<void> {
    const actor = req?.user;
    if (!actor?.userId) {
      qb.andWhere("1 = 0");
      return;
    }

    if (canReadEmployeeTickets(actor)) {
      return;
    }

    const accessConditions = [
      actor.employeeId ? "entity.employeeId = :employeeId" : null,
      `EXISTS (
        SELECT 1
        FROM "employee_ticket_participants" "participant"
        WHERE "participant"."employeeTicketId" = entity.id
          AND "participant"."userId" = :userId
          AND "participant"."deletedAt" IS NULL
      )`,
    ].filter(Boolean);

    if (accessConditions.length > 0) {
      qb.andWhere(`(${accessConditions.join(" OR ")})`, {
        employeeId: actor.employeeId,
        userId: actor.userId,
      });
      return;
    }

    qb.andWhere("1 = 0");
  }
}
