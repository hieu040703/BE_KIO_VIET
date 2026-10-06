import { injectable, inject } from "inversify";
import { RetailBundlesService } from "./bundles.service";
import { RETAIL_BUNDLES_TYPES } from "./bundles.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailBundlesController extends BaseController<RetailBundlesService> {
  constructor(@inject(RETAIL_BUNDLES_TYPES.Service) protected service: RetailBundlesService) {
    super(service);
  }
}
