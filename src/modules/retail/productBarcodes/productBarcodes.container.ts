import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailProductBarcodesController } from "./productBarcodes.controller";
import { RetailProductBarcodesRepository } from "./productBarcodes.repository";
import { RetailProductBarcodesRouter } from "./productBarcodes.route";
import { RetailProductBarcodesService } from "./productBarcodes.service";
import { RETAIL_PRODUCT_BARCODES_TYPES } from "./productBarcodes.types";

export const productBarcodesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailProductBarcodesRepository>(RETAIL_PRODUCT_BARCODES_TYPES.Repository).to(RetailProductBarcodesRepository);
  options.bind<RetailProductBarcodesService>(RETAIL_PRODUCT_BARCODES_TYPES.Service).to(RetailProductBarcodesService);
  options.bind<RetailProductBarcodesController>(RETAIL_PRODUCT_BARCODES_TYPES.Controller).to(RetailProductBarcodesController);
  options.bind<RetailProductBarcodesRouter>(RETAIL_PRODUCT_BARCODES_TYPES.Router).to(RetailProductBarcodesRouter);
});
