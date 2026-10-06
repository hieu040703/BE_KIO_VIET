import { injectable, inject } from "inversify";
import { RetailBundleItemsService } from "./bundleItems.service";
import { RETAIL_BUNDLE_ITEMS_TYPES } from "./bundleItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailBundleItemsController extends BaseController<RetailBundleItemsService> {
  constructor(@inject(RETAIL_BUNDLE_ITEMS_TYPES.Service) protected service: RetailBundleItemsService) {
    super(service);
  }
}
