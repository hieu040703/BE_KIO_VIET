import { injectable } from "inversify";
import { RetailFiles } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { FILES_RESOURCE } from "./files.types";

@injectable()
export class RetailFilesRepository extends BaseRepository<RetailFiles> {
  protected entityClass = RetailFiles;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[FILES_RESOURCE];
  }
}
