import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailFiles } from "@/database/models/retail/RetailGenericEntities";
import { RetailFilesRepository } from "./files.repository";
import { RETAIL_FILES_TYPES } from "./files.types";

@injectable()
export class RetailFilesService extends BaseService<RetailFiles> {
  constructor(@inject(RETAIL_FILES_TYPES.Repository) repository: RetailFilesRepository) {
    super(repository);
  }
}
