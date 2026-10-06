import DatabaseConfig from "@/database/database";
import { ServiceOrderChatMessage } from "@/database/models/ServiceOrderChatMessage";
import { injectable } from "inversify";
import { IEntityManager } from "@/shared/types/interfaces";
import {
  ServiceOrderChatMessageRelations,
  ServiceOrderChatMessageSelectFull,
} from "./serviceOrderChat.select";

@injectable()
export class ServiceOrderChatRepository {
  private getRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(ServiceOrderChatMessage);
  }

  async findById(id: string, manager?: IEntityManager): Promise<ServiceOrderChatMessage | null> {
    return this.getRepository(manager).findOne({
      where: {
        id,
      },
      select: ServiceOrderChatMessageSelectFull,
      relations: ServiceOrderChatMessageRelations,
    });
  }

  async create(data: Partial<ServiceOrderChatMessage>, manager?: IEntityManager): Promise<ServiceOrderChatMessage> {
    const repository = this.getRepository(manager);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  async listMessages(
    serviceOrderId: string,
    options: { page: number; size: number; sortOrder: "ASC" | "DESC" },
    manager?: IEntityManager,
  ): Promise<{ data: ServiceOrderChatMessage[]; total: number }> {
    const repository = this.getRepository(manager);
    const [data, total] = await repository.findAndCount({
      where: {
        serviceOrderId,
      },
      select: ServiceOrderChatMessageSelectFull,
      relations: ServiceOrderChatMessageRelations,
      order: {
        timeAt: options.sortOrder,
      },
      skip: (options.page - 1) * options.size,
      take: options.size,
    });

    return { data, total };
  }
}
