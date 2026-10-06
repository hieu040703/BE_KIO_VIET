import { injectable } from "inversify";
import { RetailEmployeeDocuments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEEDOCUMENTS_RESOURCE } from "./employeeDocuments.types";

@injectable()
export class RetailEmployeeDocumentsRepository extends BaseRepository<RetailEmployeeDocuments> {
  protected entityClass = RetailEmployeeDocuments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEEDOCUMENTS_RESOURCE];
  }
}
