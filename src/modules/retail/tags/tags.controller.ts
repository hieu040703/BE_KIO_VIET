import { injectable, inject } from "inversify";
import { RetailTagsService } from "./tags.service";
import { RETAIL_TAGS_TYPES } from "./tags.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailTagsController extends BaseController<RetailTagsService> {
  constructor(@inject(RETAIL_TAGS_TYPES.Service) protected service: RetailTagsService) {
    super(service);
  }
}
