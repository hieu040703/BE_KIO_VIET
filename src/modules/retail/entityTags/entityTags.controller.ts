import { injectable, inject } from "inversify";
import { RetailEntityTagsService } from "./entityTags.service";
import { RETAIL_ENTITY_TAGS_TYPES } from "./entityTags.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEntityTagsController extends BaseController<RetailEntityTagsService> {
  constructor(@inject(RETAIL_ENTITY_TAGS_TYPES.Service) protected service: RetailEntityTagsService) {
    super(service);
  }
}
