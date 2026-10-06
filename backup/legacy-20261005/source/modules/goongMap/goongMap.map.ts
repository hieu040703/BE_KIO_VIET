import { OrderStatusEnum } from "@/shared/constants/constance";
import { IAddress } from "@/modules/common/common.validator";

export type ProcessingOrderMapOrderRow = {
  orderId: string;
  code: string;
  name: string | null;
  timeAt: Date | string;
  status: OrderStatusEnum;
  address: IAddress | string | null;
};

export type ProcessingOrderMapEmployeeRow = {
  orderId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeePhone: string | null;
  employeeZaloName: string | null;
  isLeader: boolean | string;
  avatar: unknown;
  checkInAt: Date | string | null;
  checkOutAt: Date | string | null;
};

export type ProcessingOrderMapAvatarRow = {
  employeeId: string;
  url: string | null;
  thumbnailUrl: string | null;
  isMain: boolean;
};

export type ProcessingOrderMapLocationRow = {
  orderId: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: Date | string;
};

export type ProcessingOrderMapLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
};

export type ProcessingOrderMapEmployee = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  zaloName: string | null;
  isLeader: boolean;
  avatarUrl: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  latestLocation: ProcessingOrderMapLocation | null;
};

export type ProcessingOrderMapItem = {
  id: string;
  code: string;
  name: string | null;
  status: OrderStatusEnum;
  timeAt: string;
  address: IAddress | null;
  employees: ProcessingOrderMapEmployee[];
};

const parseAddress = (value: IAddress | string | null): IAddress | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as IAddress;
    } catch {
      return null;
    }
  }

  return value;
};

const normalizeAddress = (value: IAddress | string | null): IAddress | null => {
  const address = parseAddress(value);
  if (!address) {
    return null;
  }

  return {
    ...address,
    latitude:
      typeof address.latitude === "number" && Number.isFinite(address.latitude) ? address.latitude : null,
    longitude:
      typeof address.longitude === "number" && Number.isFinite(address.longitude) ? address.longitude : null,
  };
};

const buildLocationKey = (orderId: string, employeeId: string): string => `${orderId}:${employeeId}`;

const normalizeTimestamp = (value: Date | string | null): string | null => {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
};

const getAvatarUrl = (avatar: unknown): string | null => {
  if (typeof avatar === "string" && avatar.trim()) {
    return avatar;
  }

  if (!Array.isArray(avatar)) {
    return null;
  }

  const avatarFiles = avatar.filter(
    (file): file is Record<string, unknown> => typeof file === "object" && file !== null,
  );
  const mainFile = avatarFiles.find((file) => file.isMain === true) ?? avatarFiles[0];

  if (!mainFile) {
    return null;
  }

  for (const field of ["thumbnailUrl", "url"]) {
    const value = mainFile[field];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
};

export const buildProcessingOrderMapItems = (
  orderRows: ProcessingOrderMapOrderRow[],
  employeeRows: ProcessingOrderMapEmployeeRow[],
  locationRows: ProcessingOrderMapLocationRow[],
  avatarRows: ProcessingOrderMapAvatarRow[] = [],
): ProcessingOrderMapItem[] => {
  const locations = new Map<string, ProcessingOrderMapLocation>();
  for (const row of locationRows) {
    locations.set(buildLocationKey(row.orderId, row.employeeId), {
      latitude: row.latitude,
      longitude: row.longitude,
      accuracy: row.accuracy,
      capturedAt: new Date(row.capturedAt).toISOString(),
    });
  }

  const avatarsByEmployee = new Map<string, ProcessingOrderMapAvatarRow[]>();
  for (const row of avatarRows) {
    const avatars = avatarsByEmployee.get(row.employeeId) ?? [];
    avatars.push(row);
    avatarsByEmployee.set(row.employeeId, avatars);
  }

  const employeesByOrder = new Map<string, Map<string, ProcessingOrderMapEmployee>>();

  const addEmployee = (
    orderId: string,
    employeeId: string,
    employeeCode: string,
    employeeName: string,
    employeePhone: string | null,
    employeeZaloName: string | null,
    isLeader: boolean | string,
    avatar: unknown,
    checkInAt: Date | string | null,
    checkOutAt: Date | string | null,
  ): void => {
    const employees = employeesByOrder.get(orderId) ?? new Map<string, ProcessingOrderMapEmployee>();
    const existing = employees.get(employeeId);
    const normalizedIsLeader = isLeader === true || isLeader === "true";
    const avatarUrl =
      existing?.avatarUrl ?? getAvatarUrl(avatarsByEmployee.get(employeeId)) ?? getAvatarUrl(avatar);

    employees.set(employeeId, {
      id: employeeId,
      code: existing?.code || employeeCode,
      name: existing?.name || employeeName,
      phone: existing?.phone ?? employeePhone,
      zaloName: existing?.zaloName ?? employeeZaloName,
      isLeader: Boolean(existing?.isLeader || normalizedIsLeader),
      avatarUrl,
      checkInAt: existing?.checkInAt ?? normalizeTimestamp(checkInAt),
      checkOutAt: existing?.checkOutAt ?? normalizeTimestamp(checkOutAt),
      latestLocation: locations.get(buildLocationKey(orderId, employeeId)) ?? null,
    });
    employeesByOrder.set(orderId, employees);
  };

  for (const row of employeeRows) {
    addEmployee(
      row.orderId,
      row.employeeId,
      row.employeeCode,
      row.employeeName,
      row.employeePhone,
      row.employeeZaloName,
      row.isLeader,
      row.avatar,
      row.checkInAt,
      row.checkOutAt,
    );
  }

  return orderRows.map((row) => ({
    id: row.orderId,
    code: row.code,
    name: row.name,
    status: row.status,
    timeAt: new Date(row.timeAt).toISOString(),
    address: normalizeAddress(row.address),
    employees: Array.from(employeesByOrder.get(row.orderId)?.values() ?? []),
  }));
};
