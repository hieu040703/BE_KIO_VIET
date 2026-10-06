import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPenalties } from "@/database/models/retail/RetailGenericEntities";
import { RetailPenaltiesRepository } from "./penalties.repository";
import { RETAIL_PENALTIES_TYPES } from "./penalties.types";

@injectable()
export class RetailPenaltiesService extends BaseService<RetailPenalties> {
  constructor(@inject(RETAIL_PENALTIES_TYPES.Repository) repository: RetailPenaltiesRepository) {
    super(repository);
  }
}
