import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { PermissionGroupRepository } from "./permissionGroup.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { PERMISSION_GROUP_TYPES } from "./permissionGroup.types";
import { COMMON_TYPES } from "../common/common.types";
import { PermissionGroup } from "@/database/models/PermissionGroup";
import { PermissionGroupRelations, PermissionGroupSelectBasic } from "./permissionGroup.select";

@injectable()
export class PermissionGroupService extends BaseService<PermissionGroup> {
  protected relations = PermissionGroupRelations;
  protected selectedFields = PermissionGroupSelectBasic;
  constructor(
    @inject(PERMISSION_GROUP_TYPES.PermissionGroupRepository)
    private permissionGroupRepository: PermissionGroupRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager
  ) {
    super(permissionGroupRepository);
  }
}
