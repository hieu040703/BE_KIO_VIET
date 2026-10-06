import { injectable } from "inversify";
import { RetailSystemSettings } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SYSTEMSETTINGS_RESOURCE } from "./systemSettings.types";

@injectable()
export class RetailSystemSettingsRepository extends BaseRepository<RetailSystemSettings> {
  protected entityClass = RetailSystemSettings;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SYSTEMSETTINGS_RESOURCE];
  }
}
