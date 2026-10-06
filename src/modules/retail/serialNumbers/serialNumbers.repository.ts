import { injectable } from "inversify";
import { RetailSerialNumbers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SERIALNUMBERS_RESOURCE } from "./serialNumbers.types";

@injectable()
export class RetailSerialNumbersRepository extends BaseRepository<RetailSerialNumbers> {
  protected entityClass = RetailSerialNumbers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SERIALNUMBERS_RESOURCE];
  }
}
