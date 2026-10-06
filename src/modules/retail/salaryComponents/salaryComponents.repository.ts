import { injectable } from "inversify";
import { RetailSalaryComponents } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SALARYCOMPONENTS_RESOURCE } from "./salaryComponents.types";

@injectable()
export class RetailSalaryComponentsRepository extends BaseRepository<RetailSalaryComponents> {
  protected entityClass = RetailSalaryComponents;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SALARYCOMPONENTS_RESOURCE];
  }
}
