import { BaseRepository } from "@/shared/base/BaseRepository";
import { OrderLeader } from "@/database/models/OrderLeader";
import { FindOptionsSelect, In, SelectQueryBuilder } from "typeorm";
import {
  OrderLeaderSelectFull,
  OrderLeaderRelations,
} from "./orderLeader.select";
import { injectable, inject } from "inversify";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { OrderLeaderQueryDto } from "./orderLeader.validator";
import { NotFoundError } from "@/shared/types/errors";
import { USER_TYPES } from "@/modules/user/user.types";
import { UserRepository } from "@/modules/user/user.repository";
import { User } from "@/database/models/User";

@injectable()
export class OrderLeaderRepository extends BaseRepository<OrderLeader> {
  protected entityClass = OrderLeader;
  protected selectedFields = OrderLeaderSelectFull;
  protected relations = OrderLeaderRelations;

  constructor(
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
  ) {
    super();
    this.setOptions();
  }

  setOptions(
    selectedFields?: FindOptionsSelect<OrderLeader> | undefined,
  ): void {
    this.selectedFields = selectedFields || OrderLeaderSelectFull;
    this.relations = OrderLeaderRelations;
  }

  async getAllUsersByOrderId(
    orderId: string,
    manager?: IEntityManager,
  ): Promise<User[]> {
    const leaders = await this.findByOptions(
      {
        where: { orderId },
        select: { employeeId: true },
      },
      manager,
    );
    const employeeIds = [
      ...new Set(leaders.map((leader) => leader.employeeId).filter(Boolean)),
    ];

    if (employeeIds.length === 0) {
      return [];
    }

    return this.userRepository.findByOptions(
      {
        where: { employeeId: In(employeeIds) },
        select: { id: true, name: true },
      },
      manager,
    );
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<OrderLeader>,
    options: OrderLeaderQueryDto,
    req?: Request,
  ): Promise<void> {
    if (req) {
      const orderId = req?.params?.orderId;

      if (orderId) {
        qb.andWhere(`entity."orderId" = :orderId`, { orderId });
      }
    }
  }
}
