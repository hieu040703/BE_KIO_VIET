import { BaseRepository } from "@/shared/base/BaseRepository";
import { FindOptionsSelect } from "typeorm";
import { ServiceOrderRatingSelectFull, ServiceOrderRatingRelations } from "./serviceOrderRating.select";
import { injectable, inject } from "inversify";
import { ServiceOrderRating } from "@/database/models/OrderRating";

@injectable()
export class ServiceOrderRatingRepository extends BaseRepository<ServiceOrderRating> {
  protected entityClass = ServiceOrderRating;
  protected selectedFields = ServiceOrderRatingSelectFull;
  protected relations = ServiceOrderRatingRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<ServiceOrderRating> | undefined): void {
    this.selectedFields = selectedFields || ServiceOrderRatingSelectFull;
    this.relations = ServiceOrderRatingRelations;
  }
}
