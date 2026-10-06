import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCouponsController } from "./coupons.controller";
import { RetailCouponsRepository } from "./coupons.repository";
import { RetailCouponsRouter } from "./coupons.route";
import { RetailCouponsService } from "./coupons.service";
import { RETAIL_COUPONS_TYPES } from "./coupons.types";

export const couponsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCouponsRepository>(RETAIL_COUPONS_TYPES.Repository).to(RetailCouponsRepository);
  options.bind<RetailCouponsService>(RETAIL_COUPONS_TYPES.Service).to(RetailCouponsService);
  options.bind<RetailCouponsController>(RETAIL_COUPONS_TYPES.Controller).to(RetailCouponsController);
  options.bind<RetailCouponsRouter>(RETAIL_COUPONS_TYPES.Router).to(RetailCouponsRouter);
});
