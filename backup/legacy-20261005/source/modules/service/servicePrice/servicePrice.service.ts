import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ServicePriceRepository } from "./servicePrice.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { SERVICE_PRICE_TYPES } from "./servicePrice.types";
import { ServicePrice } from "@/database/models/ServicePrice";
import { ServicePriceRelations, ServicePriceSelectFull } from "./servicePrice.select";
import { COMMON_TYPES } from "@/modules/common/common.types";

@injectable()
export class ServicePriceService extends BaseService<ServicePrice> {
  protected relations = ServicePriceRelations;
  protected selectedFields = ServicePriceSelectFull;
  constructor(
    @inject(SERVICE_PRICE_TYPES.ServicePriceRepository) private servicePriceRepository: ServicePriceRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(servicePriceRepository);
  }
}
