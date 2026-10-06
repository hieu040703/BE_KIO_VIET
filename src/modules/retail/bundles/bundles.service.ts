import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailBundles } from "@/database/models/retail/RetailGenericEntities";
import { RetailBundlesRepository } from "./bundles.repository";
import { RETAIL_BUNDLES_TYPES } from "./bundles.types";

@injectable()
export class RetailBundlesService extends BaseService<RetailBundles> {
  constructor(@inject(RETAIL_BUNDLES_TYPES.Repository) repository: RetailBundlesRepository) {
    super(repository);
  }
}
