import { injectable } from "inversify";
import { EntityManager, In, IsNull } from "typeorm";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { EmployeeTicketParticipant } from "@/database/models/EmployeeTicketParticipant";
import {
  EmployeeTicketParticipantRelations,
  EmployeeTicketParticipantSelectFull,
} from "./employeeTicketParticipant.select";

@injectable()
export class EmployeeTicketParticipantRepository extends BaseRepository<EmployeeTicketParticipant> {
  protected entityClass = EmployeeTicketParticipant;
  protected selectedFields = EmployeeTicketParticipantSelectFull;
  protected relations = EmployeeTicketParticipantRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(): void {
    this.selectedFields = EmployeeTicketParticipantSelectFull;
    this.relations = EmployeeTicketParticipantRelations;
  }

  async findActiveByTicketId(
    employeeTicketId: string,
    manager?: EntityManager,
  ): Promise<EmployeeTicketParticipant[]> {
    return this.getRepository(manager).find({
      where: { employeeTicketId, deletedAt: IsNull() },
      select: EmployeeTicketParticipantSelectFull,
      relations: EmployeeTicketParticipantRelations,
      order: { createdAt: "ASC" },
    });
  }

  async findActiveByTicketAndUserIds(
    employeeTicketId: string,
    userIds: string[],
    manager?: EntityManager,
  ): Promise<EmployeeTicketParticipant[]> {
    if (userIds.length === 0) {
      return [];
    }

    return this.getRepository(manager).find({
      where: { employeeTicketId, userId: In(userIds), deletedAt: IsNull() },
      select: { id: true, userId: true, employeeTicketId: true },
    });
  }

  async findActiveByTicketAndUser(
    employeeTicketId: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<EmployeeTicketParticipant | null> {
    return this.getRepository(manager).findOne({
      where: { employeeTicketId, userId, deletedAt: IsNull() },
      select: { id: true, employeeTicketId: true, userId: true },
    });
  }

  async findActiveUserIdsByTicketId(
    employeeTicketId: string,
    manager?: EntityManager,
  ): Promise<string[]> {
    const participants = await this.getRepository(manager).find({
      where: { employeeTicketId, deletedAt: IsNull() },
      select: { userId: true },
    });
    return participants.map((participant) => participant.userId);
  }

  async softDeleteByTicketAndUser(
    employeeTicketId: string,
    userId: string,
    removedByUserId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const participant = await this.findActiveByTicketAndUser(employeeTicketId, userId, manager);
    if (!participant) {
      return false;
    }

    await this.getRepository(manager).update(participant.id, {
      deletedAt: new Date(),
      removedByUserId,
    } as any);
    return true;
  }
}
