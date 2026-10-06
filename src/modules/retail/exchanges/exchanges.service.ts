import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailExchanges } from "@/database/models/retail/RetailGenericEntities";
import { RetailExchangesRepository } from "./exchanges.repository";
import { RETAIL_EXCHANGES_TYPES } from "./exchanges.types";

@injectable()
export class RetailExchangesService extends BaseService<RetailExchanges> {
  constructor(@inject(RETAIL_EXCHANGES_TYPES.Repository) repository: RetailExchangesRepository) {
    super(repository);
  }
}
