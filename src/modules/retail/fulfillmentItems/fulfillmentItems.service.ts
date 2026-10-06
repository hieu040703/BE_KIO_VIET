import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailFulfillmentItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailFulfillmentItemsRepository } from "./fulfillmentItems.repository";
import { RETAIL_FULFILLMENT_ITEMS_TYPES } from "./fulfillmentItems.types";

@injectable()
export class RetailFulfillmentItemsService extends BaseService<RetailFulfillmentItems> {
  constructor(@inject(RETAIL_FULFILLMENT_ITEMS_TYPES.Repository) repository: RetailFulfillmentItemsRepository) {
    super(repository);
  }
}
