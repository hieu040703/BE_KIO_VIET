import { injectable, inject } from "inversify";
import { RetailApiKeysService } from "./apiKeys.service";
import { RETAIL_API_KEYS_TYPES } from "./apiKeys.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailApiKeysController extends BaseController<RetailApiKeysService> {
  constructor(@inject(RETAIL_API_KEYS_TYPES.Service) protected service: RetailApiKeysService) {
    super(service);
  }
}
