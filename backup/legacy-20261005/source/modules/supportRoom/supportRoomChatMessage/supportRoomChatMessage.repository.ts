import DatabaseConfig from "@/database/database";
import { SupportRoomChatMessage } from "@/database/models/SupportRoomChatMessage";
import { injectable } from "inversify";
import { IEntityManager } from "@/shared/types/interfaces";
import { SupportRoomChatMessageRelations, SupportRoomChatMessageSelectFull } from "./supportRoomChatMessage.select";

@injectable()
export class SupportRoomChatMessageRepository {
  private getRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(SupportRoomChatMessage);
  }

  async findById(id: string, manager?: IEntityManager): Promise<SupportRoomChatMessage | null> {
    return this.getRepository(manager).findOne({
      where: { id },
      select: SupportRoomChatMessageSelectFull,
      relations: SupportRoomChatMessageRelations,
    });
  }

  async create(data: Partial<SupportRoomChatMessage>, manager?: IEntityManager): Promise<SupportRoomChatMessage> {
    const repository = this.getRepository(manager);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  async listMessages(
    supportRoomId: string,
    options: { page: number; size: number; sortOrder: "ASC" | "DESC" },
    manager?: IEntityManager,
  ): Promise<{ data: SupportRoomChatMessage[]; total: number }> {
    const repository = this.getRepository(manager);
    const [data, total] = await repository.findAndCount({
      where: { supportRoomId },
      select: SupportRoomChatMessageSelectFull,
      relations: SupportRoomChatMessageRelations,
      order: { timeAt: options.sortOrder },
      skip: (options.page - 1) * options.size,
      take: options.size,
    });
    return { data, total };
  }

  async findLastMessage(supportRoomId: string, manager?: IEntityManager): Promise<SupportRoomChatMessage | null> {
    return this.getRepository(manager).findOne({
      where: { supportRoomId },
      select: SupportRoomChatMessageSelectFull,
      relations: SupportRoomChatMessageRelations,
      order: { timeAt: "DESC" },
    });
  }
}
