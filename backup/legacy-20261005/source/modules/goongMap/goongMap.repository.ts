import DatabaseConfig from "@/database/database";
import { File } from "@/database/models/File";
import { Order } from "@/database/models/Order";
import { OrderManagerLocation } from "@/database/models/OrderManagerLocation";
import { OrderEmployee } from "@/database/models/OrderEmployee";
import { User } from "@/database/models/User";
import { IAddress } from "@/modules/common/common.validator";
import {
  FileCategoryEnum,
  FileStatusEnum,
  OrderStatusEnum,
  ServiceOrderStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { IEntityManager } from "@/shared/types/interfaces";
import { Request } from "express";
import { injectable } from "inversify";
import { In, IsNull } from "typeorm";
import {
  ProcessingOrderMapAvatarRow,
  buildProcessingOrderMapItems,
  ProcessingOrderMapEmployeeRow,
  ProcessingOrderMapItem,
  ProcessingOrderMapLocationRow,
  ProcessingOrderMapOrderRow,
} from "./goongMap.map";
import { container } from "../container";
import { OrderService } from "../order/order.service";
import { ORDER_TYPES } from "../order/order.types";

type OrderTrackingContextRow = {
  orderId: string;
  serviceOrderId: string | null;
  customerId: string;
  orderStatus: OrderStatusEnum;
  serviceOrderStatus: ServiceOrderStatusEnum | null;
  address: IAddress | string | null;
  deliveryAddress: IAddress | string | null;
  customerAddress: IAddress | string | null;
  fieldLeaderEmployeeId: string | null;
  orderLeaderEmployeeId: string | null;
};

export type GoongOrderTrackingContext = {
  orderId: string;
  serviceOrderId: string | null;
  customerId: string;
  orderStatus: OrderStatusEnum;
  serviceOrderStatus: ServiceOrderStatusEnum | null;
  address: IAddress | null;
  deliveryAddress: IAddress | null;
  customerAddress: IAddress | null;
  fieldLeaderEmployeeIds: string[];
  orderLeaderEmployeeIds: string[];
};

export type GoongActiveOrderTrackingTarget = {
  orderId: string;
  serviceOrderId: string | null;
  customerId: string;
  employeeId: string;
  employeeUserId: string | null;
  customerUserId: string | null;
};

const parseAddress = (value: unknown): IAddress | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return JSON.parse(value) as IAddress;
  }

  return value as IAddress;
};

@injectable()
export class GoongMapRepository {
  private getOrderRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(Order);
  }

  private getLocationRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(OrderManagerLocation);
  }

  private getFileRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(File);
  }

  private getOrderEmployeeRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(OrderEmployee);
  }

  async findProcessingOrderMapData(
    page: number,
    size: number,
    req?: Request,
    manager?: IEntityManager,
    orderId?: string,
    keyword?: string,
  ): Promise<{ data: ProcessingOrderMapItem[]; total: number }> {
    const orderRepository = this.getOrderRepository(manager);
    const orderQuery = orderRepository
      .createQueryBuilder("order")
      .select([
        '"order"."id" AS "orderId"',
        '"order"."code" AS "code"',
        '"order"."name" AS "name"',
        '"order"."timeAt" AS "timeAt"',
        '"order"."status" AS "status"',
        '"order"."address" AS "address"',
      ])
      .where('"order"."deletedAt" IS NULL')
      .andWhere('"order"."status" = :status', { status: OrderStatusEnum.PROCESSING });

    console.log("orderId", orderId);

    if (orderId) {
      orderQuery.andWhere('"order"."id" = :orderId', { orderId });
    }

    const user = req?.user;

    console.log(user);
    const canViewAll = user?.role === UserRoleEnum.ADMIN || user?.viewAll === true;
    if (!canViewAll) {
      if (!user?.employeeId) {
        return { data: [], total: 0 };
      }

      orderQuery.andWhere(
        '(EXISTS (SELECT 1 FROM "order_employees" AS "oe" WHERE "oe"."orderId" = "order"."id" AND "oe"."employeeId" = :employeeId  AND "oe"."deletedAt" IS NULL) OR EXISTS (SELECT 1 FROM "order_leaders" AS "ol" WHERE "ol"."orderId" = "order"."id" AND "ol"."employeeId" = :employeeId AND "ol"."deletedAt" IS NULL))',
        { employeeId: user.employeeId },
      );
    }

    const total = await orderQuery.clone().getCount();
    const orderRows = await orderQuery
      .orderBy('"order"."timeAt"', "DESC")
      .addOrderBy('"order"."id"', "DESC")
      .skip((page - 1) * size)
      .take(size)
      .getRawMany<ProcessingOrderMapOrderRow>();

    if (orderRows.length === 0) {
      return { data: [], total };
    }

    const orderIds = orderRows.map((row) => row.orderId);
    const employeeRows = await this.getOrderEmployeeRepository(manager)
      .createQueryBuilder("orderEmployee")
      .innerJoin("orderEmployee.employee", "employee")
      .select([
        '"orderEmployee"."orderId" AS "orderId"',
        '"orderEmployee"."employeeId" AS "employeeId"',
        '"employee"."code" AS "employeeCode"',
        '"employee"."name" AS "employeeName"',
        '"employee"."phone" AS "employeePhone"',
        '"employee"."zaloName" AS "employeeZaloName"',
        '"employee"."avatar" AS "avatar"',
        '"orderEmployee"."isLeader" AS "isLeader"',
        '"orderEmployee"."checkInAt" AS "checkInAt"',
        '"orderEmployee"."checkOutAt" AS "checkOutAt"',
      ])
      .where('"orderEmployee"."orderId" IN (:...orderIds)', { orderIds })
      .andWhere('"orderEmployee"."deletedAt" IS NULL')
      .andWhere('"employee"."deletedAt" IS NULL')
      .orderBy('"orderEmployee"."isLeader"', "DESC")
      .addOrderBy('"orderEmployee"."createdAt"', "ASC")
      .getRawMany<ProcessingOrderMapEmployeeRow>();

    const employeeIds = [...new Set(employeeRows.map((row) => row.employeeId))];
    const avatarFiles =
      employeeIds.length > 0
        ? await this.getFileRepository(manager).find({
            where: {
              entityId: In(employeeIds),
              category: FileCategoryEnum.AVATAR,
              status: FileStatusEnum.ACTIVE,
              deletedAt: IsNull(),
            } as any,
            order: { isMain: "DESC", createdAt: "DESC" } as any,
          })
        : [];
    const avatarRows: ProcessingOrderMapAvatarRow[] = avatarFiles
      .filter((file): file is File & { entityId: string } => Boolean(file.entityId))
      .map((file) => ({
        employeeId: file.entityId,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        isMain: file.isMain,
      }));

    const locationRows = await this.getLocationRepository(manager)
      .createQueryBuilder("location")
      .select([
        '"location"."orderId" AS "orderId"',
        '"location"."employeeId" AS "employeeId"',
        '"location"."latitude" AS "latitude"',
        '"location"."longitude" AS "longitude"',
        '"location"."accuracy" AS "accuracy"',
        '"location"."capturedAt" AS "capturedAt"',
      ])
      .distinctOn(['"location"."orderId"', '"location"."employeeId"'])
      .where('"location"."orderId" IN (:...orderIds)', { orderIds })
      .andWhere('"location"."deletedAt" IS NULL')
      .orderBy('"location"."orderId"', "ASC")
      .addOrderBy('"location"."employeeId"', "ASC")
      .addOrderBy('"location"."capturedAt"', "DESC")
      .addOrderBy('"location"."createdAt"', "DESC")
      .getRawMany<ProcessingOrderMapLocationRow>();

    return {
      data: buildProcessingOrderMapItems(orderRows, employeeRows, locationRows, avatarRows),
      total,
    };
  }

  async getOrderTrackingContext(orderId: string, manager?: IEntityManager): Promise<GoongOrderTrackingContext | null> {
    const rows = await this.getOrderRepository(manager)
      .createQueryBuilder("trackedOrder")
      .leftJoin(
        "trackedOrder.orderEmployees",
        "fieldLeader",
        '"fieldLeader"."isLeader" = true AND "fieldLeader"."deletedAt" IS NULL',
      )
      .leftJoin("trackedOrder.orderLeaders", "orderLeader")
      .leftJoin("trackedOrder.customer", "customer")
      .leftJoin("trackedOrder.serviceOrder", "serviceOrder")
      .select([
        '"trackedOrder"."id" AS "orderId"',
        '"trackedOrder"."serviceOrderId" AS "serviceOrderId"',
        '"trackedOrder"."customerId" AS "customerId"',
        '"trackedOrder"."status" AS "orderStatus"',
        '"serviceOrder"."status" AS "serviceOrderStatus"',
        '"trackedOrder"."address" AS "address"',
        '"trackedOrder"."deliveryAddress" AS "deliveryAddress"',
        '"customer"."address" AS "customerAddress"',
        '"fieldLeader"."employeeId" AS "fieldLeaderEmployeeId"',
        '"orderLeader"."employeeId" AS "orderLeaderEmployeeId"',
      ])
      .where('"trackedOrder"."id" = :orderId', { orderId })
      .andWhere('"trackedOrder"."deletedAt" IS NULL')
      .getRawMany<OrderTrackingContextRow>();

    if (rows.length === 0) {
      return null;
    }

    const firstRow = rows[0];

    return {
      orderId: firstRow.orderId,
      serviceOrderId: firstRow.serviceOrderId ?? null,
      customerId: firstRow.customerId,
      orderStatus: firstRow.orderStatus,
      serviceOrderStatus: firstRow.serviceOrderStatus ?? null,
      address: parseAddress(firstRow.address),
      deliveryAddress: parseAddress(firstRow.deliveryAddress),
      customerAddress: parseAddress(firstRow.customerAddress),
      fieldLeaderEmployeeIds: [...new Set(rows.map((row) => row.fieldLeaderEmployeeId).filter(Boolean) as string[])],
      orderLeaderEmployeeIds: [...new Set(rows.map((row) => row.orderLeaderEmployeeId).filter(Boolean) as string[])],
    };
  }

  async findOrderIdByServiceOrderId(serviceOrderId: string, manager?: IEntityManager): Promise<string | null> {
    const order = await this.getOrderRepository(manager).findOne({
      where: { serviceOrderId } as any,
      select: { id: true } as any,
    });
    return order?.id ?? null;
  }

  async findActiveTrackingTargets(
    manager?: IEntityManager,
    orderId?: string,
    includeInactive: boolean = false,
  ): Promise<GoongActiveOrderTrackingTarget[]> {
    const activeOrderStatuses = [OrderStatusEnum.PROCESSING];

    const assignedTargets = await this.getOrderEmployeeRepository(manager)
      .createQueryBuilder("orderEmployee")
      .innerJoin("orderEmployee.order", "trackedOrder")
      .innerJoin("orderEmployee.employee", "employee")
      .innerJoin("employee.user", "employeeUser")
      .leftJoin(User, "customerUser", '"customerUser"."customerId" = "trackedOrder"."customerId"')
      .select([
        '"trackedOrder"."id" AS "orderId"',
        '"trackedOrder"."serviceOrderId" AS "serviceOrderId"',
        '"trackedOrder"."customerId" AS "customerId"',
        '"orderEmployee"."employeeId" AS "employeeId"',
        '"employeeUser"."id" AS "employeeUserId"',
        '"customerUser"."id" AS "customerUserId"',
      ])
      .where('"orderEmployee"."deletedAt" IS NULL')
      .andWhere('"trackedOrder"."deletedAt" IS NULL')
      .andWhere(
        includeInactive ? "1 = 1" : '"trackedOrder"."status" IN (:...activeOrderStatuses)',
        includeInactive ? {} : { activeOrderStatuses },
      );

    if (orderId) {
      assignedTargets.andWhere('"trackedOrder"."id" = :orderId', { orderId });
    }

    return assignedTargets.getRawMany<GoongActiveOrderTrackingTarget>();
  }

  async findLatestLocations(
    orderId: string,
    employeeId?: string,
    limit: number = 1,
    manager?: IEntityManager,
  ): Promise<OrderManagerLocation[]> {
    const qb = this.getLocationRepository(manager)
      .createQueryBuilder("location")
      .where('location."orderId" = :orderId', { orderId })
      .andWhere('location."deletedAt" IS NULL');

    if (employeeId) {
      qb.andWhere('location."employeeId" = :employeeId', { employeeId });
    }

    return qb.orderBy('location."capturedAt"', "DESC").take(limit).getMany();
  }

  async createLocation(data: Partial<OrderManagerLocation>, manager?: IEntityManager): Promise<OrderManagerLocation> {
    const repository = this.getLocationRepository(manager);
    const entity = repository.create(data);
    return repository.save(entity);
  }
}
