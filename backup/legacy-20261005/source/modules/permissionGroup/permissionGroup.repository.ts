import { BaseRepository } from "@/shared/base/BaseRepository";
import { PermissionGroup } from "@/database/models/PermissionGroup";
import { FindOptionsSelect } from "typeorm";
import { PermissionGroupSelectFull, PermissionGroupRelations } from "./permissionGroup.select";

export class PermissionGroupRepository extends BaseRepository<PermissionGroup> {
  protected entityClass = PermissionGroup;
  protected selectedFields = PermissionGroupSelectFull;
  protected relations = PermissionGroupRelations;

  constructor() {
    super();
  }

  setOptions(selectedFields?: FindOptionsSelect<PermissionGroup> | undefined): void {
    this.selectedFields = selectedFields || PermissionGroupSelectFull;
    this.relations = PermissionGroupRelations;
  }
}
