import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerTags } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerTagsRepository } from "./customerTags.repository";
import { RETAIL_CUSTOMER_TAGS_TYPES } from "./customerTags.types";

@injectable()
export class RetailCustomerTagsService extends BaseService<RetailCustomerTags> {
  constructor(@inject(RETAIL_CUSTOMER_TAGS_TYPES.Repository) repository: RetailCustomerTagsRepository) {
    super(repository);
  }
}
