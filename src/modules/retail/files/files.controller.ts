import { injectable, inject } from "inversify";
import { RetailFilesService } from "./files.service";
import { RETAIL_FILES_TYPES } from "./files.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailFilesController extends BaseController<RetailFilesService> {
  constructor(@inject(RETAIL_FILES_TYPES.Service) protected service: RetailFilesService) {
    super(service);
  }
}
