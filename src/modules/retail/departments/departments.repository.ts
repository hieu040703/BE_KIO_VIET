import { injectable } from "inversify";
import { RetailDepartments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { DEPARTMENTS_RESOURCE } from "./departments.types";

@injectable()
export class RetailDepartmentsRepository extends BaseRepository<RetailDepartments> {
  protected entityClass = RetailDepartments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[DEPARTMENTS_RESOURCE];
  }
}
