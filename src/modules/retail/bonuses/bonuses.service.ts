import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailBonuses } from "@/database/models/retail/RetailGenericEntities";
import { RetailBonusesRepository } from "./bonuses.repository";
import { RETAIL_BONUSES_TYPES } from "./bonuses.types";

@injectable()
export class RetailBonusesService extends BaseService<RetailBonuses> {
  constructor(@inject(RETAIL_BONUSES_TYPES.Repository) repository: RetailBonusesRepository) {
    super(repository);
  }
}
