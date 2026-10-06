import { BaseRepository } from "@/shared/base/BaseRepository";
    import { Service } from "@/database/models/Service";
    import { FindOptionsSelect } from "typeorm";
    import { ServiceSelectFull, ServiceRelations } from "./service.select";
    import { injectable, inject } from "inversify";

    @injectable()
    export class ServiceRepository extends BaseRepository<Service> {
      protected entityClass = Service;
      protected selectedFields = ServiceSelectFull;
      protected relations = ServiceRelations;

      constructor() {
        super();
        this.setOptions();
      }

      setOptions(selectedFields?: FindOptionsSelect<Service> | undefined): void {
        this.selectedFields = selectedFields || ServiceSelectFull;
        this.relations = ServiceRelations;
      }
    }
    