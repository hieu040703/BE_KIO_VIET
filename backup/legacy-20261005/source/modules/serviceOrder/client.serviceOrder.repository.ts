import { BaseRepository } from "@/shared/base/BaseRepository";
import { ServiceOrder } from "@/database/models/ServiceOrder";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { ServiceOrderSelectFull, ServiceOrderRelations } from "./serviceOrder.select";
import { injectable } from "inversify";
import { IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";

@injectable()
export class ClientServiceOrderRepository extends BaseRepository<ServiceOrder> {
  protected entityClass = ServiceOrder;
  protected selectedFields = ServiceOrderSelectFull;
  protected relations = ServiceOrderRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<ServiceOrder> | undefined): void {
    this.selectedFields = selectedFields || ServiceOrderSelectFull;
    this.relations = ServiceOrderRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<ServiceOrder>,
    options: IFindOptions<ServiceOrder>,
    req?: Request,
  ): Promise<void> {
    Object.assign(options, { relations: this.relations });
    Object.assign(options, { select: this.selectedFields });

    const customerId = req?.user?.customerId;
    if (typeof customerId === "string" && customerId.trim().length > 0) {
      qb.andWhere("entity.customerId = :customerId", { customerId });
    }
  }
}
