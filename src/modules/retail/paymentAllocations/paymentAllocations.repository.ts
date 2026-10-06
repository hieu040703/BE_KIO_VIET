import { injectable } from "inversify";
import { RetailPaymentAllocations } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYMENTALLOCATIONS_RESOURCE } from "./paymentAllocations.types";

@injectable()
export class RetailPaymentAllocationsRepository extends BaseRepository<RetailPaymentAllocations> {
  protected entityClass = RetailPaymentAllocations;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYMENTALLOCATIONS_RESOURCE];
  }
}
