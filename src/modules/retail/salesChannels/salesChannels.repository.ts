import { injectable } from "inversify";
import { RetailSalesChannels } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SALESCHANNELS_RESOURCE } from "./salesChannels.types";

@injectable()
export class RetailSalesChannelsRepository extends BaseRepository<RetailSalesChannels> {
  protected entityClass = RetailSalesChannels;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SALESCHANNELS_RESOURCE];
  }
}
