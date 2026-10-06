import { injectable, inject } from "inversify";
import { RetailBrandsService } from "./brands.service";
import { RETAIL_BRANDS_TYPES } from "./brands.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailBrandsController extends BaseController<RetailBrandsService> {
  constructor(@inject(RETAIL_BRANDS_TYPES.Service) protected service: RetailBrandsService) {
    super(service);
  }
}
