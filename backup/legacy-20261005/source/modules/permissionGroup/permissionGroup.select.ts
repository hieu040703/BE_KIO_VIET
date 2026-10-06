import { PermissionGroup } from "@/database/models/PermissionGroup";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const PermissionGroupSelectBasic: FindOptionsSelect<PermissionGroup> = {
  id: true,
  name: true,
  permissions: true,
};

export const PermissionGroupSelectFull: FindOptionsSelect<PermissionGroup> = {
  ...PermissionGroupSelectBasic,
};

export const PermissionGroupRelations: FindOptionsRelations<PermissionGroup> = {};
