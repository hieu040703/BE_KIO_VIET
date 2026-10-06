import { BaseRepository } from "@/shared/base/BaseRepository";
    import { ServicePrice } from "@/database/models/ServicePrice";
    import { FindOptionsSelect } from "typeorm";
    import { ServicePriceSelectFull, ServicePriceRelations } from "./servicePrice.select";
    import { injectable, inject } from "inversify";

    @injectable()
    export class ServicePriceRepository extends BaseRepository<ServicePrice> {
      protected entityClass = ServicePrice;
      protected selectedFields = ServicePriceSelectFull;
      protected relations = ServicePriceRelations;

      constructor() {
        super();
        this.setOptions();
      }

      setOptions(selectedFields?: FindOptionsSelect<ServicePrice> | undefined): void {
        this.selectedFields = selectedFields || ServicePriceSelectFull;
        this.relations = ServicePriceRelations;
      }
    }
    