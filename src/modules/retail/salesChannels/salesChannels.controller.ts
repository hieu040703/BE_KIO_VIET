import { injectable, inject } from "inversify";
import { RetailSalesChannelsService } from "./salesChannels.service";
import { RETAIL_SALES_CHANNELS_TYPES } from "./salesChannels.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSalesChannelsController extends BaseController<RetailSalesChannelsService> {
  constructor(@inject(RETAIL_SALES_CHANNELS_TYPES.Service) protected service: RetailSalesChannelsService) {
    super(service);
  }
}
