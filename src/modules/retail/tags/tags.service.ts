import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailTags } from "@/database/models/retail/RetailGenericEntities";
import { RetailTagsRepository } from "./tags.repository";
import { RETAIL_TAGS_TYPES } from "./tags.types";

@injectable()
export class RetailTagsService extends BaseService<RetailTags> {
  constructor(@inject(RETAIL_TAGS_TYPES.Repository) repository: RetailTagsRepository) {
    super(repository);
  }
}
