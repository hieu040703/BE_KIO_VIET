import { injectable } from "inversify";
import { RetailCustomerActivities } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERACTIVITIES_RESOURCE } from "./customerActivities.types";

@injectable()
export class RetailCustomerActivitiesRepository extends BaseRepository<RetailCustomerActivities> {
  protected entityClass = RetailCustomerActivities;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERACTIVITIES_RESOURCE];
  }
}
