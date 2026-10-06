import { injectable } from "inversify";
import { RetailTenant } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { TENANTS_RESOURCE } from "./tenants.types";

@injectable()
export class RetailTenantsRepository extends BaseRepository<RetailTenant> {
  protected entityClass = RetailTenant;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[TENANTS_RESOURCE];
  }
}
