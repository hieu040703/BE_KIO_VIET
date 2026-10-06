import { injectable } from "inversify";
import { RetailFulfillments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { FULFILLMENTS_RESOURCE } from "./fulfillments.types";

@injectable()
export class RetailFulfillmentsRepository extends BaseRepository<RetailFulfillments> {
  protected entityClass = RetailFulfillments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[FULFILLMENTS_RESOURCE];
  }
}
