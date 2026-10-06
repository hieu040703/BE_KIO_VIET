import { injectable, inject } from "inversify";
    import { BaseService } from "@/shared/base/BaseService";
    import { ServiceRepository } from "./service.repository";
    import { TransactionManager } from "@/shared/base/TransactionManager";
    import { SERVICE_TYPES } from "./service.types";
    import { COMMON_TYPES } from "../common/common.types";
    import { Service } from "@/database/models/Service";
    import { ServiceRelations, ServiceSelectFull } from "./service.select";

    @injectable()
    export class ClientServiceService extends BaseService<Service> {
      protected relations = ServiceRelations;
      protected selectedFields = ServiceSelectFull;
      constructor(
        @inject(SERVICE_TYPES.ServiceRepository) private serviceRepository: ServiceRepository,
        @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager
      ) {
        super(serviceRepository);
      }
    }
