import { injectable } from "inversify";
import { RetailReconciliations } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { RECONCILIATIONS_RESOURCE } from "./reconciliations.types";

@injectable()
export class RetailReconciliationsRepository extends BaseRepository<RetailReconciliations> {
  protected entityClass = RetailReconciliations;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[RECONCILIATIONS_RESOURCE];
  }
}
