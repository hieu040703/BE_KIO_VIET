import { injectable } from "inversify";
import { RetailCashRegisters } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CASHREGISTERS_RESOURCE } from "./cashRegisters.types";

@injectable()
export class RetailCashRegistersRepository extends BaseRepository<RetailCashRegisters> {
  protected entityClass = RetailCashRegisters;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CASHREGISTERS_RESOURCE];
  }
}
