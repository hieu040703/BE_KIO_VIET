import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ServiceRepository } from "./service.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { SERVICE_TYPES } from "./service.types";
import { COMMON_TYPES } from "../common/common.types";
import { Service } from "@/database/models/Service";
import { ServiceRelations, ServiceSelectFull } from "./service.select";
import { ServicePriceRepository } from "./servicePrice/servicePrice.repository";
import { SERVICE_PRICE_TYPES } from "./servicePrice/servicePrice.types";
import { DeepPartial } from "typeorm";
import { Request } from "express";
import { IEntityManager, ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";

@injectable()
export class AdminServiceService extends BaseService<Service> {
  protected relations = ServiceRelations;
  protected selectedFields = ServiceSelectFull;

  constructor(
    @inject(SERVICE_TYPES.ServiceRepository) private serviceRepository: ServiceRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(SERVICE_PRICE_TYPES.ServicePriceRepository) private servicePriceRepository: ServicePriceRepository,
  ) {
    super(serviceRepository);
  }

  async create(data: DeepPartial<Service>, req?: Request, manager?: IEntityManager): Promise<ApiResponse<Service>> {
    const inputData = data as any;
    const prices: Array<{
      category: string;
      unit: string;
      quantity: number;
      price: number;
      excessUnitPrice: number;
      note?: string | null;
    }> = inputData.prices || [];
    delete inputData.prices;

    return await this.transactionManager.withTransactionCallback(async (txManager) => {
      const result = await super.create(inputData, req, txManager);
      const service = result.data as Service;

      if (service?.id && prices.length > 0) {
        for (const p of prices) {
          await this.servicePriceRepository.create(
            {
              serviceId: service.id,
              category: p.category,
              unit: p.unit,
              quantity: p.quantity,
              price: p.price,
              excessUnitPrice: p.excessUnitPrice,
              note: p.note,
            },
            txManager,
          );
        }
        const fullData = await this.serviceRepository.findById(service.id, txManager, false, req);
        return ApiResponseHandler.createSuccess("OK", fullData || service);
      }

      return result;
    });
  }

  async update(
    id: string,
    data: Partial<Service>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<Service>> {
    const inputData = data as any;
    const prices:
      | Array<{
          category: string;
          unit: string;
          quantity: number;
          price: number;
          excessUnitPrice: number;
          note?: string | null;
        }>
      | undefined = inputData.prices;
    delete inputData.prices;

    return await this.transactionManager.withTransactionCallback(async (txManager) => {
      const result = await super.update(id, inputData, req, txManager);
      const service = result.data as Service;

      if (prices !== undefined) {
        await this.servicePriceRepository.deleteWithOption({ serviceId: id } as any, txManager);

        for (const p of prices) {
          await this.servicePriceRepository.create(
            {
              serviceId: id,
              category: p.category,
              unit: p.unit,
              quantity: p.quantity,
              price: p.price,
              excessUnitPrice: p.excessUnitPrice,
              note: p.note,
            },
            txManager,
          );
        }

        const fullData = await this.serviceRepository.findById(id, txManager, false, req);
        return ApiResponseHandler.updateSuccess("OK", fullData || service);
      }

      return result;
    });
  }
}
