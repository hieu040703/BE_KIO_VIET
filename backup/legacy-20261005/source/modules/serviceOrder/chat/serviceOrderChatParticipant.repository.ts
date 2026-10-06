import DatabaseConfig from "@/database/database";
import { ServiceOrderChatParticipant } from "@/database/models/ServiceOrderChatParticipant";
import { injectable } from "inversify";
import { IEntityManager } from "@/shared/types/interfaces";
import { IsNull } from "typeorm";

@injectable()
export class ServiceOrderChatParticipantRepository {
  private getRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(ServiceOrderChatParticipant);
  }

  async findByServiceOrderId(
    serviceOrderId: string,
    manager?: IEntityManager,
  ): Promise<ServiceOrderChatParticipant[]> {
    return this.getRepository(manager).find({
      where: { serviceOrderId, deletedAt: IsNull() },
      select: {
        id: true,
        serviceOrderId: true,
        userId: true,
        addedByUserId: true,
        createdAt: true,
        user: { id: true, name: true, username: true, avatar: true, role: true, employeeId: true, customerId: true },
        addedBy: { id: true, name: true, username: true },
      },
      relations: { user: true, addedBy: true },
    });
  }

  async findActiveByServiceOrderAndUser(
    serviceOrderId: string,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ServiceOrderChatParticipant | null> {
    return this.getRepository(manager).findOne({
      where: { serviceOrderId, userId, deletedAt: IsNull() },
    });
  }

  async create(
    data: { serviceOrderId: string; userId: string; addedByUserId: string | null },
    manager?: IEntityManager,
  ): Promise<ServiceOrderChatParticipant> {
    const repo = this.getRepository(manager);
    const entity = repo.create(data);
    return repo.save(entity);
  }

  async softDelete(id: string, manager?: IEntityManager): Promise<void> {
    await this.getRepository(manager).update(id, { deletedAt: new Date() } as any);
  }
}
