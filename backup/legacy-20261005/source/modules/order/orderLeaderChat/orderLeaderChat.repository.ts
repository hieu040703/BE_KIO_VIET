import { injectable } from "inversify";
import { Brackets, FindOptionsSelect, In, IsNull, SelectQueryBuilder } from "typeorm";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { OrderLeaderChat } from "@/database/models/OrderLeaderChat";
import {
  OrderLeaderChatRelations,
  OrderLeaderChatSelectBasic,
  OrderLeaderChatSelectFull,
} from "./orderLeaderChat.select";
import { Request } from "express";

@injectable()
export class OrderLeaderChatRepository extends BaseRepository<OrderLeaderChat> {
  protected entityClass = OrderLeaderChat;
  protected selectedFields = OrderLeaderChatSelectFull;
  protected relations = OrderLeaderChatRelations;
  protected multipleFile = true;
  protected nestedFileFields = ["user.employee"];

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<OrderLeaderChat>): void {
    this.selectedFields = selectedFields || OrderLeaderChatSelectFull;
    this.relations = OrderLeaderChatRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<OrderLeaderChat>,
    options: IFindOptions<OrderLeaderChat>,
    req?: Request,
  ): Promise<void> {
    const orderId = req?.params?.orderId;
    if (orderId) {
      qb.andWhere("entity.orderId = :orderId", { orderId });
    }
    qb.addOrderBy("entity.timeAt", "DESC").addOrderBy("entity.id", "DESC");
  }

  async listMessages(
    orderId: string,
    beforeMessageId: string | undefined,
    limit: number,
    manager?: IEntityManager,
  ): Promise<{ data: OrderLeaderChat[]; hasMore: boolean; nextCursor: string | null }> {
    const repository = this.getRepository(manager);
    const anchor = beforeMessageId
      ? await repository.findOne({
          where: { id: beforeMessageId, orderId },
          select: { id: true, timeAt: true },
          withDeleted: true,
        })
      : null;

    const idRows = await repository
      .createQueryBuilder("entity")
      .select(["entity.id", "entity.timeAt"])
      .where("entity.orderId = :orderId", { orderId })
      .andWhere("entity.deletedAt IS NULL")
      .andWhere(
        anchor
          ? new Brackets((query) => {
              query
                .where("entity.timeAt < :anchorTimeAt", { anchorTimeAt: anchor.timeAt })
                .orWhere("entity.timeAt = :anchorTimeAt AND entity.id < :anchorId", {
                  anchorTimeAt: anchor.timeAt,
                  anchorId: anchor.id,
                });
            })
          : "1 = 1",
      )
      .orderBy("entity.timeAt", "DESC")
      .addOrderBy("entity.id", "DESC")
      .take(limit + 1)
      .getMany();

    const hasMore = idRows.length > limit;
    const pageRows = idRows.slice(0, limit);
    const ids = pageRows.map((row) => row.id);
    if (ids.length === 0) {
      return { data: [], hasMore: false, nextCursor: null };
    }

    const messages = await this.findByOptions(
      {
        where: { id: In(ids), orderId, deletedAt: IsNull() } as any,
        select: OrderLeaderChatSelectFull,
        relations: OrderLeaderChatRelations,
      },
      manager,
    );
    const messageById = new Map(messages.map((message) => [message.id, message]));
    const data = ids.map((id) => messageById.get(id)).filter(Boolean) as OrderLeaderChat[];

    return {
      data,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1]?.id || null : null,
    };
  }

  async countUnread(orderId: string, lastReadMessageId: string | null, manager?: IEntityManager): Promise<number> {
    const repository = this.getRepository(manager);
    const query = repository
      .createQueryBuilder("entity")
      .where("entity.orderId = :orderId", { orderId })
      .andWhere("entity.deletedAt IS NULL");

    if (lastReadMessageId) {
      const anchor = await repository.findOne({
        where: { id: lastReadMessageId, orderId },
        select: { id: true, timeAt: true },
        withDeleted: true,
      });

      if (anchor) {
        query.andWhere(
          new Brackets((subQuery) => {
            subQuery
              .where("entity.timeAt > :anchorTimeAt", { anchorTimeAt: anchor.timeAt })
              .orWhere("entity.timeAt = :anchorTimeAt AND entity.id > :anchorId", {
                anchorTimeAt: anchor.timeAt,
                anchorId: anchor.id,
              });
          }),
        );
      }
    }

    return query.getCount();
  }

  async findMessageInOrder(
    orderId: string,
    messageId: string,
    manager?: IEntityManager,
    includeDeleted = false,
  ): Promise<OrderLeaderChat | null> {
    return this.findByOption(
      {
        where: { id: messageId, orderId },
        select: OrderLeaderChatSelectBasic,
      },
      manager,
      includeDeleted,
    );
  }
}
