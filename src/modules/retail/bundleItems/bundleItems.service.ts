import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailBundleItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailBundleItemsRepository } from "./bundleItems.repository";
import { RETAIL_BUNDLE_ITEMS_TYPES } from "./bundleItems.types";

@injectable()
export class RetailBundleItemsService extends BaseService<RetailBundleItems> {
  constructor(@inject(RETAIL_BUNDLE_ITEMS_TYPES.Repository) repository: RetailBundleItemsRepository) {
    super(repository);
  }
}
