import { BaseRepository } from "@/shared/base/BaseRepository";
import { Invoice } from "@/database/models/Invoice";
import { FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { InvoiceSelectFull, InvoiceRelations } from "./invoice.select";
import { injectable } from "inversify";
import { Request } from "express";
import { InvoiceQueryDto } from "./invoice.validator";

@injectable()
export class InvoiceRepository extends BaseRepository<Invoice> {
  protected entityClass = Invoice;
  protected selectedFields = InvoiceSelectFull;
  protected relations = InvoiceRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Invoice> | undefined): void {
    this.selectedFields = selectedFields || InvoiceSelectFull;
    this.relations = InvoiceRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<Invoice>,
    options: InvoiceQueryDto,
    req?: Request,
  ): Promise<void> {
    if (options.customerIds && options.customerIds.length > 0) {
      qb.andWhere(`${qb.alias}.customerId IN (:...customerIds)`, { customerIds: options.customerIds });
    }
    if (options.branchIds && options.branchIds.length > 0) {
      qb.andWhere(`${qb.alias}.branchId IN (:...branchIds)`, { branchIds: options.branchIds });
    }
    if (options.employeeIds && options.employeeIds.length > 0) {
      qb.andWhere(`${qb.alias}.employeeId IN (:...employeeIds)`, { employeeIds: options.employeeIds });
    }
  }
}
