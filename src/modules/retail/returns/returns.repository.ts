import { injectable } from "inversify";
import { RetailReturns } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { RETURNS_RESOURCE } from "./returns.types";

@injectable()
export class RetailReturnsRepository extends BaseRepository<RetailReturns> {
  protected entityClass = RetailReturns;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[RETURNS_RESOURCE];
  }
}
