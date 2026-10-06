import { injectable } from "inversify";
import { RetailEmployee } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEES_RESOURCE } from "./employees.types";

@injectable()
export class RetailEmployeesRepository extends BaseRepository<RetailEmployee> {
  protected entityClass = RetailEmployee;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEES_RESOURCE];
  }
}
