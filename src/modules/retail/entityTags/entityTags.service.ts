import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEntityTags } from "@/database/models/retail/RetailGenericEntities";
import { RetailEntityTagsRepository } from "./entityTags.repository";
import { RETAIL_ENTITY_TAGS_TYPES } from "./entityTags.types";

@injectable()
export class RetailEntityTagsService extends BaseService<RetailEntityTags> {
  constructor(@inject(RETAIL_ENTITY_TAGS_TYPES.Repository) repository: RetailEntityTagsRepository) {
    super(repository);
  }
}
