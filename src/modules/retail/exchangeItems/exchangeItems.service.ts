import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailExchangeItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailExchangeItemsRepository } from "./exchangeItems.repository";
import { RETAIL_EXCHANGE_ITEMS_TYPES } from "./exchangeItems.types";

@injectable()
export class RetailExchangeItemsService extends BaseService<RetailExchangeItems> {
  constructor(@inject(RETAIL_EXCHANGE_ITEMS_TYPES.Repository) repository: RetailExchangeItemsRepository) {
    super(repository);
  }
}
