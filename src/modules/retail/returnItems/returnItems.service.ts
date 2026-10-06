import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailReturnItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailReturnItemsRepository } from "./returnItems.repository";
import { RETAIL_RETURN_ITEMS_TYPES } from "./returnItems.types";

@injectable()
export class RetailReturnItemsService extends BaseService<RetailReturnItems> {
  constructor(@inject(RETAIL_RETURN_ITEMS_TYPES.Repository) repository: RetailReturnItemsRepository) {
    super(repository);
  }
}
