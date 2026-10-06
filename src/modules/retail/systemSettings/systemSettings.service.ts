import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSystemSettings } from "@/database/models/retail/RetailGenericEntities";
import { RetailSystemSettingsRepository } from "./systemSettings.repository";
import { RETAIL_SYSTEM_SETTINGS_TYPES } from "./systemSettings.types";

@injectable()
export class RetailSystemSettingsService extends BaseService<RetailSystemSettings> {
  constructor(@inject(RETAIL_SYSTEM_SETTINGS_TYPES.Repository) repository: RetailSystemSettingsRepository) {
    super(repository);
  }
}
