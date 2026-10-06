import { injectable } from "inversify";
import { RetailApiKeys } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { APIKEYS_RESOURCE } from "./apiKeys.types";

@injectable()
export class RetailApiKeysRepository extends BaseRepository<RetailApiKeys> {
  protected entityClass = RetailApiKeys;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[APIKEYS_RESOURCE];
  }
}
