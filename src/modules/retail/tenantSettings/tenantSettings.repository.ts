import { injectable } from "inversify";
import { RetailTenantSettings } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { TENANTSETTINGS_RESOURCE } from "./tenantSettings.types";

@injectable()
export class RetailTenantSettingsRepository extends BaseRepository<RetailTenantSettings> {
  protected entityClass = RetailTenantSettings;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[TENANTSETTINGS_RESOURCE];
  }
}
