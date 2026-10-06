import { injectable, inject } from "inversify";
    import { PermissionGroupService } from "./permissionGroup.service";
    import { PERMISSION_GROUP_TYPES } from "./permissionGroup.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class PermissionGroupController extends BaseController<PermissionGroupService> {
      constructor(@inject(PERMISSION_GROUP_TYPES.PermissionGroupService) protected service: PermissionGroupService) {
        super(service);
      }
    }
    