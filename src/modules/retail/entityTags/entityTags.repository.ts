import { injectable } from "inversify";
import { RetailEntityTags } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ENTITYTAGS_RESOURCE } from "./entityTags.types";

@injectable()
export class RetailEntityTagsRepository extends BaseRepository<RetailEntityTags> {
  protected entityClass = RetailEntityTags;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ENTITYTAGS_RESOURCE];
  }
}
