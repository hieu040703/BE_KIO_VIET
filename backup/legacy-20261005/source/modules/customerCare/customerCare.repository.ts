import { CustomerCare } from "@/database/models/CustomerCare";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { injectable } from "inversify";
import { EntityManager, FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import {
  CustomerCareRelations,
  CustomerCareSelectFull,
} from "./customerCare.select";

@injectable()
export class CustomerCareRepository extends BaseRepository<CustomerCare> {
  protected entityClass = CustomerCare;
  protected selectedFields = CustomerCareSelectFull;
  protected relations = CustomerCareRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<CustomerCare>): void {
    this.selectedFields = selectedFields || CustomerCareSelectFull;
    this.relations = CustomerCareRelations;
  }

  async delete(
    id: string,
    manager?: EntityManager,
    req?: Request,
  ): Promise<boolean> {
    return this.softDelete(id, manager, req);
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<CustomerCare>,
    options: IFindOptions<CustomerCare>,
    _req?: Request,
  ): Promise<void> {
    const customerId = options.moreQuery?.customerId;
    if (customerId) {
      qb.andWhere("entity.customerId = :customerId", { customerId });
    }

    if (!options.sortBy) {
      qb.orderBy("entity.scheduledAt", "DESC");
    }
  }
}
