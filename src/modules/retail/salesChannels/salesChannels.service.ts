import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSalesChannels } from "@/database/models/retail/RetailGenericEntities";
import { RetailSalesChannelsRepository } from "./salesChannels.repository";
import { RETAIL_SALES_CHANNELS_TYPES } from "./salesChannels.types";

@injectable()
export class RetailSalesChannelsService extends BaseService<RetailSalesChannels> {
  constructor(@inject(RETAIL_SALES_CHANNELS_TYPES.Repository) repository: RetailSalesChannelsRepository) {
    super(repository);
  }
}
