import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAttributes } from "@/database/models/retail/RetailGenericEntities";
import { RetailAttributesRepository } from "./attributes.repository";
import { RETAIL_ATTRIBUTES_TYPES } from "./attributes.types";

@injectable()
export class RetailAttributesService extends BaseService<RetailAttributes> {
  constructor(@inject(RETAIL_ATTRIBUTES_TYPES.Repository) repository: RetailAttributesRepository) {
    super(repository);
  }
}
