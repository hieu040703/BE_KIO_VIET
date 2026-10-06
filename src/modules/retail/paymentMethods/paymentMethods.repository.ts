import { injectable } from "inversify";
import { RetailPaymentMethods } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYMENTMETHODS_RESOURCE } from "./paymentMethods.types";

@injectable()
export class RetailPaymentMethodsRepository extends BaseRepository<RetailPaymentMethods> {
  protected entityClass = RetailPaymentMethods;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYMENTMETHODS_RESOURCE];
  }
}
