import DatabaseConfig from "@/database/database";
import { Order } from "@/database/models/Order";
import { OrderManagerLocation } from "@/database/models/OrderManagerLocation";
import { OrderEmployee } from "@/database/models/OrderEmployee";
import { User } from "@/database/models/User";
import { IAddress } from "@/modules/common/common.validator";
import { OrderStatusEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";
import { IEntityManager } from "@/shared/types/interfaces";
import { injectable } from "inversify";

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

export type OrderTrackingContext = {
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

export type ActiveOrderTrackingTarget = {
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
export class GoogleMapRepository {
  private getOrderRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(Order);
  }

  private getLocationRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(OrderManagerLocation);
  }

  private getOrderEmployeeRepository(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(OrderEmployee);
  }

  async getOrderTrackingContext(orderId: string, manager?: IEntityManager): Promise<OrderTrackingContext | null> {
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
      fieldLeaderEmployeeIds: [
        ...new Set(rows.map((row) => row.fieldLeaderEmployeeId).filter(Boolean) as string[]),
      ],
      orderLeaderEmployeeIds: [
        ...new Set(rows.map((row) => row.orderLeaderEmployeeId).filter(Boolean) as string[]),
      ],
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
  ): Promise<ActiveOrderTrackingTarget[]> {
    const activeOrderStatuses = [OrderStatusEnum.PENDING, OrderStatusEnum.PROCESSING];
    const activeServiceOrderStatuses = [ServiceOrderStatusEnum.CONFIRMED, ServiceOrderStatusEnum.PROCESSING];

    const query = this.getOrderEmployeeRepository(manager)
      .createQueryBuilder("orderEmployee")
      .innerJoin("orderEmployee.order", "trackedOrder")
      .leftJoin("trackedOrder.serviceOrder", "serviceOrder")
      .leftJoin(
        User,
        "employeeUser",
        '"employeeUser"."employeeId" = "orderEmployee"."employeeId"',
      )
      .leftJoin(
        User,
        "customerUser",
        '"customerUser"."customerId" = "trackedOrder"."customerId"',
      )
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
      .andWhere('"trackedOrder"."serviceOrderId" IS NOT NULL')
      .andWhere(
        includeInactive ? "1 = 1" : '"trackedOrder"."status" IN (:...activeOrderStatuses)',
        includeInactive ? {} : { activeOrderStatuses },
      )
      .andWhere(
        includeInactive ? "1 = 1" : '"serviceOrder"."status" IN (:...activeServiceOrderStatuses)',
        includeInactive ? {} : { activeServiceOrderStatuses },
      );

    if (orderId) {
      query.andWhere('"trackedOrder"."id" = :orderId', { orderId });
    }

    return query.getRawMany<ActiveOrderTrackingTarget>();
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
