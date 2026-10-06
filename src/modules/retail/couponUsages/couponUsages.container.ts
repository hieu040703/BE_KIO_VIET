import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCouponUsagesController } from "./couponUsages.controller";
import { RetailCouponUsagesRepository } from "./couponUsages.repository";
import { RetailCouponUsagesRouter } from "./couponUsages.route";
import { RetailCouponUsagesService } from "./couponUsages.service";
import { RETAIL_COUPON_USAGES_TYPES } from "./couponUsages.types";

export const couponUsagesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCouponUsagesRepository>(RETAIL_COUPON_USAGES_TYPES.Repository).to(RetailCouponUsagesRepository);
  options.bind<RetailCouponUsagesService>(RETAIL_COUPON_USAGES_TYPES.Service).to(RetailCouponUsagesService);
  options.bind<RetailCouponUsagesController>(RETAIL_COUPON_USAGES_TYPES.Controller).to(RetailCouponUsagesController);
  options.bind<RetailCouponUsagesRouter>(RETAIL_COUPON_USAGES_TYPES.Router).to(RetailCouponUsagesRouter);
});
