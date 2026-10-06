import DatabaseConfig from "@/database/database";
import { OrderCommentReadState } from "@/database/models/OrderCommentReadState";
import { IEntityManager } from "@/shared/types/interfaces";
import { injectable } from "inversify";
import { IsNull } from "typeorm";

@injectable()
export class OrderCommentReadStateRepository {
  private getRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(OrderCommentReadState);
  }

  async findActive(orderId: string, userId: string, manager?: IEntityManager): Promise<OrderCommentReadState | null> {
    return this.getRepository(manager).findOne({
      where: { orderId, userId, deletedAt: IsNull() },
      select: { id: true, orderId: true, userId: true, lastReadCommentId: true },
    });
  }

  async saveCheckpoint(
    orderId: string,
    userId: string,
    lastReadCommentId: string,
    manager?: IEntityManager,
  ): Promise<OrderCommentReadState> {
    const repository = this.getRepository(manager);
    const existing = await this.findActive(orderId, userId, manager);
    if (existing) {
      existing.lastReadCommentId = lastReadCommentId;
      return repository.save(existing);
    }

    return repository.save(
      repository.create({
        orderId,
        userId,
        lastReadCommentId,
      }),
    );
  }

  async deleteFromOrder(orderId: string, manager?: IEntityManager): Promise<void> {
    await this.getRepository(manager).softDelete({ orderId } as any);
  }
}
