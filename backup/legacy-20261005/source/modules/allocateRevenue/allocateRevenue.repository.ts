import { BaseRepository } from "@/shared/base/BaseRepository";
import { AllocateRevenue } from "@/database/models/AllocateRevenue";
import { FindOptionsSelect } from "typeorm";
import { injectable } from "inversify";
import { AllocateRevenueRelations, AllocateRevenueSelectFull } from "./allocateRevenue.select";

@injectable()
export class AllocateRevenueRepository extends BaseRepository<AllocateRevenue> {
  protected entityClass = AllocateRevenue;
  protected selectedFields = AllocateRevenueSelectFull;
  protected relations = AllocateRevenueRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<AllocateRevenue> | undefined): void {
    this.selectedFields = selectedFields || AllocateRevenueSelectFull;
    this.relations = AllocateRevenueRelations;
  }
}
