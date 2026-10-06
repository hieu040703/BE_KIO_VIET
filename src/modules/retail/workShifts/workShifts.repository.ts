import { injectable } from "inversify";
import { RetailWorkShifts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { WORKSHIFTS_RESOURCE } from "./workShifts.types";

@injectable()
export class RetailWorkShiftsRepository extends BaseRepository<RetailWorkShifts> {
  protected entityClass = RetailWorkShifts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[WORKSHIFTS_RESOURCE];
  }
}
