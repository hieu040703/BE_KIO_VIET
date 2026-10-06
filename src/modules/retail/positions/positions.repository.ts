import { injectable } from "inversify";
import { RetailPositions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { POSITIONS_RESOURCE } from "./positions.types";

@injectable()
export class RetailPositionsRepository extends BaseRepository<RetailPositions> {
  protected entityClass = RetailPositions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[POSITIONS_RESOURCE];
  }
}
