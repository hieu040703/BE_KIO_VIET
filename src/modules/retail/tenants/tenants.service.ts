import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailTenant } from "@/database/models";
import { RetailTenantsRepository } from "./tenants.repository";
import { RETAIL_TENANTS_TYPES } from "./tenants.types";

@injectable()
export class RetailTenantsService extends BaseService<RetailTenant> {
  constructor(@inject(RETAIL_TENANTS_TYPES.Repository) repository: RetailTenantsRepository) {
    super(repository);
  }
}
