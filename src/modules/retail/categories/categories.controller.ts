import { injectable, inject } from "inversify";
import { RetailCategoriesService } from "./categories.service";
import { RETAIL_CATEGORIES_TYPES } from "./categories.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCategoriesController extends BaseController<RetailCategoriesService> {
  constructor(@inject(RETAIL_CATEGORIES_TYPES.Service) protected service: RetailCategoriesService) {
    super(service);
  }
}
