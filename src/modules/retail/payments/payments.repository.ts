import { injectable } from "inversify";
import { RetailPayment } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYMENTS_RESOURCE } from "./payments.types";

@injectable()
export class RetailPaymentsRepository extends BaseRepository<RetailPayment> {
  protected entityClass = RetailPayment;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYMENTS_RESOURCE];
  }
}
