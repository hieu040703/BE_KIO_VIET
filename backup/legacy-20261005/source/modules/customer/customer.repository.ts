import { BaseRepository } from "@/shared/base/BaseRepository";
import { Customer } from "@/database/models/Customer";
import { EntityManager, FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { CustomerSelectFull, CustomerRelations } from "./customer.select";
import { injectable, inject } from "inversify";
import { IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { CustomerQueryDto } from "./customer.validator";
import { AdsEnum } from "@/shared/constants/constance";
import { User } from "@/database/models/User";
import { Order } from "@/database/models/Order";
import { NotificationDetail } from "@/database/models/NotificationDetail";
import { Token } from "@/database/models/Token";
import { ServiceOrderChatParticipant } from "@/database/models/ServiceOrderChatParticipant";

@injectable()
export class CustomerRepository extends BaseRepository<Customer> {
  protected entityClass = Customer;
  protected selectedFields = CustomerSelectFull;
  protected relations = CustomerRelations;

  constructor() {
    super();
    this.setOptions();
  }

  /**
   * Override delete để xóa luôn User account của customer (nếu có) và các dependent rows
   * trước khi xóa customer.
   *
   * Flow:
   *  1. Lấy userIds của các User có customerId = id.
   *  2. Hard-delete các row phụ thuộc vào User (NotificationDetail, Token, ChatParticipant)
   *     để tránh FK violation khi xóa User.
   *  3. Hard-delete User account.
   *  4. Hard-delete Customer (logic mặc định của BaseRepository).
   *
   * Tất cả thao tác dùng chung EntityManager → atomic (rollback nếu lỗi).
   */
  async delete(id: string, manager?: EntityManager, req?: Request): Promise<boolean> {
    const repository = this.getRepository(manager);
    const entityManager = repository.manager;

    // 1. Lấy User account(s) của customer này
    const users = await entityManager.getRepository(User).find({
      where: { customerId: id },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    // 2. Cleanup dependents rồi xóa User (nếu có)
    if (userIds.length > 0) {
      //? Thông báo đã gửi tới user
      await entityManager
        .getRepository(NotificationDetail)
        .createQueryBuilder()
        .delete()
        .where("userId IN (:...userIds)", { userIds })
        .execute();

      //? FCM token của các thiết bị user đã đăng nhập
      await entityManager
        .getRepository(Token)
        .createQueryBuilder()
        .delete()
        .where("userId IN (:...userIds)", { userIds })
        .execute();

      //? Tham gia phòng chat của service order
      await entityManager
        .getRepository(ServiceOrderChatParticipant)
        .createQueryBuilder()
        .delete()
        .where("userId IN (:...userIds)", { userIds })
        .execute();

      // 3. Xóa User account
      await entityManager
        .getRepository(User)
        .createQueryBuilder()
        .delete()
        .where("id IN (:...userIds)", { userIds })
        .execute();

      console.log(
        `[CustomerRepository.delete] Deleted ${userIds.length} user account(s) + dependents for customer ${id}`,
      );
    }

    // 4. Xóa Customer (logic mặc định của BaseRepository)
    const entity = await repository.findOne({
      where: { id } as any,
    });

    if (!entity) {
      return false;
    }

    await this.handleFilesOnDelete(id, manager);
    await repository.remove(entity);
    return true;
  }

  setOptions(selectedFields?: FindOptionsSelect<Customer> | undefined): void {
    this.selectedFields = selectedFields || CustomerSelectFull;
    this.relations = CustomerRelations;
  }

  protected async extendSummaryFields(
    summary: any,
    qb: SelectQueryBuilder<Customer>,
    options: IFindOptions<Customer>,
  ): Promise<void> {
    qb.expressionMap.wheres = qb.expressionMap.wheres.filter(
      (where) => !String(where.condition).includes("entity.source"),
    );

    const all = await qb.getCount();
    summary.all = all;

    const googleCount = await qb.clone().andWhere("entity.source = :source", { source: AdsEnum.GOOGLE }).getCount();
    summary.googleCount = googleCount;

    const facebookCount = await qb.clone().andWhere("entity.source = :source", { source: AdsEnum.FACEBOOK }).getCount();
    summary.facebookCount = facebookCount;

    const youtubeCount = await qb.clone().andWhere("entity.source = :source", { source: AdsEnum.YOUTUBE }).getCount();
    summary.youtubeCount = youtubeCount;

    const instagramCount = await qb
      .clone()
      .andWhere("entity.source = :source", { source: AdsEnum.INSTAGRAM })
      .getCount();
    summary.instagramCount = instagramCount;

    const tiktokCount = await qb.clone().andWhere("entity.source = :source", { source: AdsEnum.TIKTOK }).getCount();
    summary.tiktokCount = tiktokCount;

    const zaloCount = await qb.clone().andWhere("entity.source = :source", { source: AdsEnum.ZALO }).getCount();
    summary.zaloCount = zaloCount;

    const otherCount = await qb.clone().andWhere("entity.source = :source", { source: AdsEnum.OTHER }).getCount();
    summary.otherCount = otherCount;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<Customer>,
    options: CustomerQueryDto,
    req?: Request,
  ): Promise<void> {
    if (options.source) {
      qb.andWhere("entity.source = :source", { source: options.source });
    }

    // Sort theo "Đơn hàng gần nhất": ORDER BY thời gian hợp đồng mới nhất của từng khách (subquery MAX timeAt).
    // FE gửi sortBy = "latestOrder.timeAt" (CÓ dấu chấm) để Base KHÔNG inject `entity.latestOrder` vào SELECT
    // (sẽ lỗi SQL vì latestOrder là field runtime, không phải column). Ở đây ta tự addOrderBy subquery
    // rồi xoá sortBy để Base không ghi đè bằng orderBy("latestOrder.timeAt") sai alias.
    if (options.sortBy === "latestOrder.timeAt") {
      const direction = ((options.sortType || options.sortOrder) as "ASC" | "DESC") || "DESC";
      const latestOrderExpr = `(SELECT MAX(o."timeAt") FROM "public"."orders" o WHERE o."customerId" = entity.id AND o."deletedAt" IS NULL)`;
      qb.addOrderBy(latestOrderExpr, direction, "NULLS LAST");
      (options as any).sortBy = undefined;
    }
  }

  async getCustomerByRevenue(startAt: Date, endAt: Date): Promise<Customer[]> {
    const result = await this.getRepository()
      .createQueryBuilder("customer")
      .leftJoin("customer.orders", "orders")
      .where("orders.timeAt BETWEEN :startAt AND :endAt", { startAt, endAt })
      .addSelect("COALESCE(SUM(orders.amount), 0)", "totalRevenue")
      .addSelect("COUNT(orders.id)", "totalOrders")
      .groupBy("customer.id")
      .orderBy("COALESCE(SUM(orders.amount), 0)", "DESC")
      .limit(10)
      .getRawAndEntities();

    // Map theo id để tránh lệch index giữa raw và entities
    const rawMap = new Map<string, { totalRevenue: string; totalOrders: string }>();
    for (const raw of result.raw) {
      rawMap.set(raw.customer_id, raw);
    }

    return result.entities.map((customer) => {
      const raw = rawMap.get(customer.id);
      (customer as any).totalRevenue = parseFloat(raw?.totalRevenue ?? "0") || 0;
      (customer as any).totalOrders = parseInt(raw?.totalOrders ?? "0") || 0;
      return customer;
    });
  }

  async getCustomerSourceRatio(): Promise<{ source: string; count: number }[]> {
    const totalCustomersResult = this.getRepository()
      .createQueryBuilder("customer")
      .select("COUNT(customer.id)", "total");

    const totalCustomers = parseInt((await totalCustomersResult.getRawOne()).total) || 1;

    const sourceResults = this.getRepository()
      .createQueryBuilder("customer")
      .select("customer.source", "source")
      .addSelect("COUNT(customer.id)", "count")
      .groupBy("customer.source");

    const sources = await sourceResults.getRawMany();

    return sources.map((source) => ({
      source: source.source,
      count: parseInt(source.count),
    }));
  }

  /**
   * Lấy hợp đồng (Order) gần nhất theo thời gian (timeAt DESC) cho từng customer trong danh sách.
   * Dùng DISTINCT ON + index IDX_orders_active_customer_timeAt (customerId, timeAt) — 1 query cho cả page.
   * Trả về dạng map-friendly: { id, code, name, timeAt, customerId }.
   */
  async getLatestOrdersByCustomerIds(
    customerIds: string[],
  ): Promise<{ id: string; code: string; name: string | null; timeAt: Date; customerId: string }[]> {
    if (!customerIds?.length) return [];

    const rows = await this.getRepository()
      .manager.getRepository(Order)
      .createQueryBuilder("order")
      .distinctOn(["order.customerId"])
      .where("order.customerId IN (:...customerIds)", { customerIds })
      .andWhere("order.deletedAt IS NULL")
      .orderBy("order.customerId")
      .addOrderBy("order.timeAt", "DESC")
      .select([
        "order.id AS id",
        "order.code AS code",
        "order.name AS name",
        "order.timeAt AS timeAt",
        "order.customerId AS customerId",
      ])
      .getRawMany();

    // Lưu ý: pg driver trả về key lowercase cho alias không quote (timeAt -> timeat, customerId -> customerid)
    // nên phải map lại về camelCase để service dùng được.
    return rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      timeAt: r.timeat,
      customerId: r.customerid,
    }));
  }
}
