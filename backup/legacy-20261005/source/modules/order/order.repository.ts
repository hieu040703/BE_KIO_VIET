import { BaseRepository } from "@/shared/base/BaseRepository";
import { Order } from "@/database/models/Order";
import { SelectQueryBuilder, Between, EntityManager, Brackets } from "typeorm";
import { OrderSelectFull, OrderRelations, OrderSelectBasic } from "./order.select";
import { injectable, inject } from "inversify";
import { OrderQueryDto } from "./order.validator";
import { Request } from "express-serve-static-core";
import { USER_TYPES } from "../user/user.types";
import { UserRepository } from "../user/user.repository";
import { UserRelations, UserSelectBasic } from "../user/user.select";
import { UnauthorizedError } from "@/shared/types/errors";
import { FINANCE_TYPES } from "../accountant/finance/finance.types";
import { FinanceRepository } from "../accountant/finance/finance.repository";
import { DEBT_TYPES } from "../accountant/debt/debt.types";
import { DebtRepository } from "../accountant/debt/debt.repository";
import { ORDER_COMMENT_TYPES } from "./orderComment/orderComment.types";
import { OrderCommentRepository } from "./orderComment/orderComment.repository";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { TRANSACTION_TYPES } from "../accountant/transaction/transaction.types";
import { Employee } from "@/database/models/Employee";
import { AllocateRevenueToEmployeesDto } from "../allocateRevenue/allocateRevenue.validator";
import { BranchSelectBasic } from "../branch/branch.select";
import { BRANCH_TYPES } from "../branch/branch.types";
import { BranchRepository } from "../branch/branch.repository";
import { TransactionRepository } from "../accountant/transaction/transaction.repository";
import {
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  OrderStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { OrderLeaderRelations, OrderLeaderSelectFull } from "./orderLeader/orderLeader.select";

type AllocatedRevenueType = {
  employee: Employee;
  totalOrder: number; // tổng số hợp đồng mà nhân viên này phụ trách / tham gia
  totalLeaderPercentAmount: number; // tổng số tiền doanh thu từ hợp đồng mà nhân viên này được hưởng (ví dụ: hợp đồng 100 triệu, nhân viên này phụ trách 70 triệu)
  allocatedRevenue: number; //? phần chia sẻ doanh thu mà nhân viên nhận được
};

@injectable()
export class OrderRepository extends BaseRepository<Order> {
  protected entityClass = Order;
  protected searchFields: (keyof Order)[] = ["name", "code", "description"];
  protected timeField: keyof Order = "timeAt";
  protected multipleFile: boolean = true;
  protected nestedFileFields = ["orderEmployees.employee"];

  constructor(
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentRepository) private orderCommentRepository: OrderCommentRepository,
    @inject(TRANSACTION_TYPES.TransactionRepository) private transactionRepository: TransactionRepository,
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
  ) {
    super();
    this.setOptions(OrderSelectFull, OrderRelations);
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<Order>,
    options: OrderQueryDto,
    req?: Request,
  ): Promise<void> {
    const userId = req?.user?.userId;
    if (!userId) {
      return;
    }

    const viewAll = req.user?.viewAll || false;

    console.log("viewAll", viewAll);

    const user = await this.userRepository.findByOption({
      where: {
        id: userId,
      },
      select: UserSelectBasic,
      relations: UserRelations,
    });

    if (!user) {
      throw new UnauthorizedError("Người dùng không tồn tại");
    }

    let managerOfBranch = null;

    if (user.employeeId) {
      //? tìm chi nhánh mà nhân viên này phụ trách
      const branch = await this.branchRepository.findByOption({
        where: {
          employeeId: user.employeeId,
        },
        select: BranchSelectBasic,
      });

      if (branch) {
        managerOfBranch = branch.id;
      } else {
        //$ TASK: lấy những Order o mà nhân viên này có trong danh sách OrderEmployee oe , với oe.orderId = o.id
        //? nhân viên không phải quản lý chi nhánh: chỉ xem những hợp đồng mà họ nằm trong danh sách order_employees
      }
    }

    //? - quản lý chi nhánh: là nhân viên đầu cánh hoặc là quản lý điều hành
    //? - nhân viên thường: có trong danh sách order_employees của hợp đồng
    //? nếu có quyền viewAll thì bỏ qua filter này để xem tất cả hợp đồng
    if (user.role !== UserRoleEnum.ADMIN && !viewAll && user.employeeId) {
      // Người tạo đơn được xem đơn của mình hoặc các đơn mà họ được phân công.
      // Gom điều kiện quyền vào một nhóm OR để các bộ lọc khác vẫn nối bằng AND.
      if (managerOfBranch) {
        qb.andWhere(
          new Brackets((scopeQb) => {
            scopeQb
              .where("entity.createdByEmployeeId = :employeeId", { employeeId: user.employeeId })
              .orWhere(
                `(EXISTS (SELECT 1 FROM order_employees oe WHERE oe."orderId" = entity.id AND oe."employeeId" = :employeeId AND oe."isLeader" = true AND oe."deletedAt" IS NULL) OR EXISTS (SELECT 1 FROM order_leaders ol WHERE ol."orderId" = entity.id AND ol."employeeId" = :employeeId AND ol."deletedAt" IS NULL))`,
                { employeeId: user.employeeId, branchId: managerOfBranch },
              );
          }),
        );
      } else {
        //? nhân viên không phải quản lý chi nhánh: lấy những Order o mà nhân viên này có trong danh sách OrderEmployee oe (oe."orderId" = entity.id)
        qb.andWhere(
          new Brackets((scopeQb) => {
            scopeQb
              .where("entity.createdByEmployeeId = :employeeId", { employeeId: user.employeeId })
              .orWhere(
                `EXISTS (SELECT 1 FROM order_employees oe WHERE oe."orderId" = entity.id AND oe."employeeId" = :employeeId AND oe."deletedAt" IS NULL)`,
                { employeeId: user.employeeId },
              );
          }),
        );
      }
    }

    if (options.customerIds) {
      qb.andWhere("entity.customerId IN (:...customerIds)", { customerIds: options.customerIds });
    }

    if (options.employeeIds) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM order_employees oe WHERE oe."orderId" = entity.id AND oe."employeeId" IN (:...employeeIds) AND oe."deletedAt" IS NULL)`,
        { employeeIds: options.employeeIds },
      );
    }

    if (options.branchIds) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: options.branchIds });
    }

    if (options.status) {
      qb.andWhere("entity.status = :status", { status: options.status });
    }

    if (options.isPaid !== undefined) {
      qb.andWhere("entity.isPaid = :isPaid", { isPaid: options.isPaid });
    }

    if (options.isVat === true) {
      qb.andWhere("entity.vat > 0");
    } else if (options.isVat === false) {
      qb.andWhere("entity.vat IS NULL");
    }

    if (options.isInvoiced !== undefined) {
      if (options.isInvoiced === true) {
        qb.andWhere("entity.isInvoiced = true");
      } else {
        qb.andWhere("entity.isInvoiced = false");
      }
    }

    if (options.referrerIds) {
      qb.andWhere("entity.referrerId IN (:...referrerIds)", { referrerIds: options.referrerIds });
    }

    // tính số tiền đã thu theo tùng hợp đồng
    qb.addSelect((subQuery) => {
      return subQuery
        .select("CAST(COALESCE(SUM(f.amount), 0) AS INTEGER)")
        .from("finances", "f")
        .where("f.orderId = entity.id")
        .andWhere("f.type = :financeType", { financeType: FinanceTypeEnum.INCOME })
        .andWhere("f.status = :approvedStatus", { approvedStatus: ExpenseApprovalStatusEnum.APPROVED });
    }, "totalIncomeAmount");

    // check trong bảng orderEmployees với orderEmployees.orderId = order.id, nếu có lớn hơn hoặc bằng 1 bản ghi có isConfirmed = false thì trả về false, ngược lại trả về true
    qb.addSelect((subQuery) => {
      return subQuery
        .select("CASE WHEN COUNT(oe.id) > 0 THEN false ELSE true END")
        .from("order_employees", "oe")
        .where('oe."orderId" = entity.id')
        .andWhere("oe.salary IS NULL")
        .andWhere("oe.deletedAt IS NULL");
    }, "isAllEmployeeConfirmed");

    // đếm số comment chưa đọc của user đang đăng nhập theo từng hợp đồng
    // dựa trên checkpoint order_comment_read_states (lastReadCommentId)
    qb.addSelect((subQuery) => {
      return subQuery
        .select("CAST(COUNT(oc.id) AS INTEGER)")
        .from("order_comments", "oc")
        .leftJoin(
          "order_comment_read_states",
          "rsc",
          'rsc."orderId" = entity.id AND rsc."userId" = :userId AND rsc."deletedAt" IS NULL',
        )
        .leftJoin("order_comments", "anchor", 'anchor."id" = rsc."lastReadCommentId"')
        .where('oc."orderId" = entity.id')
        .andWhere("oc.deletedAt IS NULL")
        .andWhere(
          new Brackets((query) => {
            query
              .where('rsc."lastReadCommentId" IS NULL')
              .orWhere('oc."timeAt" > anchor."timeAt"')
              .orWhere('oc."timeAt" = anchor."timeAt" AND oc."id" > anchor."id"');
          }),
        )
        .setParameter("userId", userId);
    }, "unreadCommentCount");

    // lấy comment mới nhất theo từng hợp đồng
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `json_build_object(
            'id', oc.id,
            'content', oc.content,
            'userId', oc."userId",
            'orderId', oc."orderId",
            'replyCommentId', oc."replyCommentId",
            'timeAt', oc."timeAt",
            'attachments', oc.attachments,
            'tags', oc.tags,
            'createdAt', oc."createdAt",
            'updatedAt', oc."updatedAt",
            'user', json_build_object(
              'id', u.id,
              'name', u.name,
              'username', u.username,
              'avatar', u.avatar
            )
          )`,
        )
        .from("order_comments", "oc")
        .leftJoin("users", "u", 'u.id = oc."userId"')
        .where('oc."orderId" = entity.id')
        .andWhere("oc.deletedAt IS NULL")
        .orderBy("oc.createdAt", "DESC")
        .limit(1);
    }, "latestComment");

    // Lấy lần gửi Zalo gần nhất để bảng hợp đồng hiển thị trạng thái và cho phép gửi lại khi lỗi.
    qb.addSelect((subQuery) => {
      return subQuery
        .select(
          `json_build_object(
            'id', zmh.id,
            'status', zmh.status,
            'errorMessage', zmh."errorMessage",
            'templateType', zmh."templateType",
            'sentAt', zmh."sentAt"
          )`,
        )
        .from("zalo_message_histories", "zmh")
        .where('zmh."orderId" = entity.id')
        .andWhere('zmh."deletedAt" IS NULL')
        .orderBy('zmh."sentAt"', "DESC")
        .addOrderBy('zmh."createdAt"', "DESC")
        .limit(1);
    }, "latestZaloMessage");
  }

  protected async extendSummaryFields(
    summary: any,
    qb: SelectQueryBuilder<Order>,
    options: IFindOptions<Order>,
  ): Promise<void> {
    // clear status in qb to avoid affecting count queries
    qb.expressionMap.wheres = qb.expressionMap.wheres.filter(
      (where) => !String(where.condition).includes("entity.status"),
    );

    const all = await qb.getCount();
    const pending = await qb
      .clone()
      .andWhere("entity.status = :status", { status: OrderStatusEnum.PENDING })
      .getCount();
    const processing = await qb
      .clone()
      .andWhere("entity.status = :status", { status: OrderStatusEnum.PROCESSING })
      .getCount();
    const completed = await qb
      .clone()
      .andWhere("entity.status = :status", { status: OrderStatusEnum.COMPLETED })
      .getCount();
    const cancelled = await qb
      .clone()
      .andWhere("entity.status = :status", { status: OrderStatusEnum.CANCELED })
      .getCount();

    //? tính tổng số tiền của tất cả hợp đồng trừ các hợp đồng đã bị hủy
    // Dùng subquery DISTINCT id để tránh row multiplication từ các JOIN one-to-many (details, orderEmployees)
    // Sau đó SUM trên bảng orders trực tiếp qua WHERE IN — không cần JOIN nào cả
    const filteredIdsQb = qb
      .clone()
      .select("entity.id") // thay toàn bộ selects (bao gồm addSelect) bằng chỉ entity.id
      .andWhere("entity.status != :canceledStatus", { canceledStatus: OrderStatusEnum.CANCELED })
      .andWhere("entity.deletedAt IS NULL");
    filteredIdsQb.expressionMap.orderBys = {};

    const totalAmount = await qb.connection
      .getRepository(Order)
      .createQueryBuilder("o")
      .select("COALESCE(SUM(o.amount), 0)", "totalAmount")
      .where(`o.id IN (${filteredIdsQb.getQuery()})`)
      .setParameters(filteredIdsQb.getParameters())
      .getRawOne();

    summary.all = all;
    summary.processingCount = processing;
    summary.completedCount = completed;
    summary.canceledCount = cancelled;
    summary.pendingCount = pending;
    summary.totalAmount = Number(totalAmount?.totalAmount) || 0;
  }

  // tìm hợp đồng theo code
  async findOrderByCode(code: string, manager?: any): Promise<Order | null> {
    return this.findByOption(
      {
        where: {
          code: code,
        },
      },
      manager,
    );
  }

  private async cleanupReferencesBeforeDelete(orderId: string, manager?: EntityManager): Promise<void> {
    const entityManager = this.getRepository(manager).manager;

    await entityManager.query(`DELETE FROM "order_comment_read_states" WHERE "orderId" = $1`, [orderId]);

    await entityManager.query(`DELETE FROM "service_order_ratings" WHERE "orderId" = $1`, [orderId]);
    await entityManager.query(`DELETE FROM "order_manager_locations" WHERE "orderId" = $1`, [orderId]);
    await entityManager.query(`DELETE FROM "call_navigations" WHERE "orderId" = $1`, [orderId]);
    await entityManager.query(`UPDATE "reward_points" SET "orderId" = NULL WHERE "orderId" = $1`, [orderId]);
    await entityManager.query(`UPDATE "invoices" SET "orderId" = NULL WHERE "orderId" = $1`, [orderId]);
    // Xóa TimeKeeping thưởng (hoa hồng giới thiệu / thưởng tạo đơn / phân bổ doanh thu)
    // liên quan đến hợp đồng. Phải xóa ở đây (trước khi xóa Order), vì nếu chỉ SET NULL
    // thì phần thưởng vẫn còn trên bảng chấm công dưới dạng bản ghi mồ côi.
    await entityManager.query(`DELETE FROM "time_keepings" WHERE "referrerOrderId" = $1`, [orderId]);
  }

  async delete(id: string, manager?: EntityManager, req?: Request): Promise<boolean> {
    await this.cleanupReferencesBeforeDelete(id, manager);
    return super.delete(id, manager, req);
  }

  // tính số tiền đã thu theo tùng hợp đồng
  async getTotalIncomeByOrderId(orderId: string, manager?: IEntityManager): Promise<number> {
    const totalIncome = await this.financeRepository.sum(
      "amount",
      {
        orderId: orderId,
        type: FinanceTypeEnum.INCOME,
        status: ExpenseApprovalStatusEnum.APPROVED,
      },
      manager,
    );

    return totalIncome;
  }

  //? hàm này lấy tất cả các hợp đồng còn công nợ của một khách hàng, dùng để hiển thị trong phần tạo mới phiếu thu để chọn hợp đồng cần thu
  async getAllUnpaidOrdersByCustomer(customerId: string, manager?: IEntityManager): Promise<Order[]> {
    const qb = this.getRepository(manager).createQueryBuilder("order");
    qb.where("order.customerId = :customerId", { customerId })
      .andWhere("order.isPaid = false")
      .andWhere("order.status = :completedStatus", { completedStatus: OrderStatusEnum.COMPLETED })
      .andWhere("order.deletedAt IS NULL");

    //? tính số tiền mà khách hàng còn nợ theo từng hợp đồng = số tiền hợp đồng - số tiền đã thu (tổng amount của các bản ghi finance có type = INCOME liên quan đến hợp đồng đó)
    qb.addSelect((subQuery) => {
      return subQuery
        .select("CAST(SUM(f.amount) AS INTEGER)")
        .from("finances", "f")
        .where("f.orderId = order.id")
        .andWhere("f.type = :financeType", { financeType: FinanceTypeEnum.INCOME })
        .andWhere("f.status = :approvedStatus", { approvedStatus: ExpenseApprovalStatusEnum.APPROVED });
    }, "totalIncomeAmount");

    const orders = await qb.getRawAndEntities();

    // map data để trả về đúng định dạng
    return orders.entities
      .map((order, index) => {
        const totalUnpaidAmount =
          order.amount - Number(orders.raw.find((r) => r.order_id === order.id)?.totalIncomeAmount) || 0;
        Object.assign(order, { totalUnpaidAmount });
        return order;
      })
      .filter((order) => order.totalUnpaidAmount && order.totalUnpaidAmount > 0); // chỉ trả về những hợp đồng còn nợ tiền (totalUnpaidAmount > 0)
  }

  //? tính tổng doanh thu các hợp đồng đã hoàn thành trogn khoảng thời gian
  async getTotalAmountByTime(startTime: Date, endTime: Date, branchId?: string): Promise<number> {
    return await this.sumByOptions("amount", {
      where: {
        ...(branchId ? { branchId } : {}),
        timeAt: Between(startTime, endTime),
        status: OrderStatusEnum.COMPLETED,
      },
    });
  }

  //? tính tổng doanh thu của các hợp đồng trong khoảng thời gian + chi nhánh (nếu có)
  async calculateTotalRevenue(
    data: AllocateRevenueToEmployeesDto,
    manager?: IEntityManager,
  ): Promise<{
    totalRevenue: number;
    totalAllocatedRevenue: number;
    totalUnallocatedRevenue: number;
    totalRevenueToAllocate: number;
    allocatedRevenues: AllocatedRevenueType[];
    orderLeaderIds: string[];
  }> {
    //? Lấy những đơn hàng trong khoảng thời gian và có trạng thái đã hoàn thành, nếu có branchId thì lọc thêm theo chi nhánh
    const orders = await this.findByOptions(
      {
        where: {
          timeAt: Between(data.startAt, data.endAt),
          ...(data.branchId ? { branchId: data.branchId } : {}),
          status: OrderStatusEnum.COMPLETED,
        },
        select: {
          ...OrderSelectBasic,
          orderLeaders: OrderLeaderSelectFull,
        },
        relations: {
          orderLeaders: OrderLeaderRelations,
        },
      },
      manager,
    );

    //? tổng doanh thu của các hợp đồng trong khoảng thời gian + chi nhánh (nếu có)
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    //? tổng doanh thu đã được phân bổ cho nhân viên (chỉ tính những quản lý đã được phân bổ, tức là orderLeaders.isRevenueAllocated = true)
    const totalAllocatedRevenue = orders.reduce((sum, order) => {
      if (order.orderLeaders && order.orderLeaders.length > 0) {
        const allocatedForOrder = order.orderLeaders.reduce((leaderSum, ol) => {
          if (ol.isRevenueShareAllocated && ol.revenueShare) {
            return leaderSum + ol.revenueShare;
          }
          return leaderSum;
        }, 0);
        return sum + allocatedForOrder;
      }
      return sum;
    }, 0);

    //? tổng doanh thu từ hợp đồng chưa được phân bổ cho nhân viên (tức là những hợp đồng có isRevenueAllocated = false)
    const totalUnallocatedRevenue = totalRevenue - totalAllocatedRevenue;

    //? tổng số tiền sẽ dùng để chia cho các nhân viên
    const totalRevenueToAllocate = (totalUnallocatedRevenue / 100) * data.revenueSharePercent;

    let allocatedRevenues: AllocatedRevenueType[] = [];
    const orderLeaderIds: string[] = [];

    for (const order of orders) {
      // if (order.isRevenueAllocated) {
      //   continue; //? nếu đã phân bổ doanh thu rồi thì bỏ qua, chỉ tính phần chưa phân bổ
      // }

      if (order.orderLeaders && order.orderLeaders.length > 0) {
        for (const ol of order.orderLeaders) {
          if (!ol.isRevenueShareAllocated && ol.revenueShare) {
            orderLeaderIds.push(ol.id);
            const existing = allocatedRevenues.find((ar) => ar.employee.id === ol.employeeId);

            if (existing) {
              existing.totalOrder += 1;
              existing.totalLeaderPercentAmount += ol.revenueShare || 0;
            } else {
              allocatedRevenues.push({
                employee: ol.employee,
                totalOrder: 1,
                totalLeaderPercentAmount: ol.revenueShare,
                allocatedRevenue: 0,
              });
            }
          }
        }
      }
    }

    //? tính phần chia sẻ doanh thu mà mỗi nhân viên nhận được dựa trên tổngLeaderPercentAmount của nhân viên đó so với tổngLeaderPercentAmount của tất cả nhân viên, rồi nhân với tổng RevenueToAllocate
    allocatedRevenues = allocatedRevenues.map((ar) => {
      if (totalUnallocatedRevenue > 0) {
        const leaderPercentRatio = ar.totalLeaderPercentAmount / totalUnallocatedRevenue;
        return {
          ...ar,
          allocatedRevenue: leaderPercentRatio * totalRevenueToAllocate,
        };
      } else {
        return {
          ...ar,
          allocatedRevenue: 0, // Set to 0 if totalUnallocatedRevenue is 0 to prevent division by zero
        };
      }
    });

    return {
      totalRevenue,
      totalAllocatedRevenue,
      totalUnallocatedRevenue,
      totalRevenueToAllocate,
      orderLeaderIds,
      allocatedRevenues,
    };
  }
}
