import { injectable } from "inversify";
import { RetailTags } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { TAGS_RESOURCE } from "./tags.types";

@injectable()
export class RetailTagsRepository extends BaseRepository<RetailTags> {
  protected entityClass = RetailTags;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[TAGS_RESOURCE];
  }
}
