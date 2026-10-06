import DatabaseConfig from "@/database/database";
import { OrderLeaderChatReadState } from "@/database/models/OrderLeaderChatReadState";
import { IEntityManager } from "@/shared/types/interfaces";
import { injectable } from "inversify";
import { IsNull } from "typeorm";

@injectable()
export class OrderLeaderChatReadStateRepository {
  private getRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(OrderLeaderChatReadState);
  }

  async findActive(orderId: string, userId: string, manager?: IEntityManager): Promise<OrderLeaderChatReadState | null> {
    return this.getRepository(manager).findOne({
      where: { orderId, userId, deletedAt: IsNull() },
      select: { id: true, orderId: true, userId: true, lastReadMessageId: true },
    });
  }

  async saveCheckpoint(
    orderId: string,
    userId: string,
    lastReadMessageId: string,
    manager?: IEntityManager,
  ): Promise<OrderLeaderChatReadState> {
    const repository = this.getRepository(manager);
    const existing = await this.findActive(orderId, userId, manager);
    if (existing) {
      existing.lastReadMessageId = lastReadMessageId;
      return repository.save(existing);
    }

    return repository.save(
      repository.create({
        orderId,
        userId,
        lastReadMessageId,
      }),
    );
  }

  async deleteFromOrder(orderId: string, manager?: IEntityManager): Promise<void> {
    await this.getRepository(manager).softDelete({ orderId } as any);
  }
}
