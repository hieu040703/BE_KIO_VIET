import { injectable } from "inversify";
import { RetailRefunds } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { REFUNDS_RESOURCE } from "./refunds.types";

@injectable()
export class RetailRefundsRepository extends BaseRepository<RetailRefunds> {
  protected entityClass = RetailRefunds;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[REFUNDS_RESOURCE];
  }
}
