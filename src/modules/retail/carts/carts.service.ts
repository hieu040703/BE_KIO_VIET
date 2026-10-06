import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCarts } from "@/database/models/retail/RetailGenericEntities";
import { RetailCartsRepository } from "./carts.repository";
import { RETAIL_CARTS_TYPES } from "./carts.types";

@injectable()
export class RetailCartsService extends BaseService<RetailCarts> {
  constructor(@inject(RETAIL_CARTS_TYPES.Repository) repository: RetailCartsRepository) {
    super(repository);
  }
}
