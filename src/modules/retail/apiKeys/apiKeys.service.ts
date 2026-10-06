import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailApiKeys } from "@/database/models/retail/RetailGenericEntities";
import { RetailApiKeysRepository } from "./apiKeys.repository";
import { RETAIL_API_KEYS_TYPES } from "./apiKeys.types";

@injectable()
export class RetailApiKeysService extends BaseService<RetailApiKeys> {
  constructor(@inject(RETAIL_API_KEYS_TYPES.Repository) repository: RetailApiKeysRepository) {
    super(repository);
  }
}
