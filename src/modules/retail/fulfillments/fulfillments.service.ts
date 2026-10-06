import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailFulfillments } from "@/database/models/retail/RetailGenericEntities";
import { RetailFulfillmentsRepository } from "./fulfillments.repository";
import { RETAIL_FULFILLMENTS_TYPES } from "./fulfillments.types";

@injectable()
export class RetailFulfillmentsService extends BaseService<RetailFulfillments> {
  constructor(@inject(RETAIL_FULFILLMENTS_TYPES.Repository) repository: RetailFulfillmentsRepository) {
    super(repository);
  }
}
