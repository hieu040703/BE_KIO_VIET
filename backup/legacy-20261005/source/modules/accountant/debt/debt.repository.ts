import { BaseRepository } from "@/shared/base/BaseRepository";
import { Debt } from "@/database/models/Debt";
import { EntityManager, FindOptionsSelect } from "typeorm";
import { DebtSelectFull, DebtRelations } from "./debt.select";
import { injectable, inject } from "inversify";
import { DebtQueryDto } from "./debt.validator";
import { Customer } from "@/database/models/Customer";
import { Finance } from "@/database/models/Finance";
import { FINANCE_TYPES } from "../finance/finance.types";
import { FinanceRepository } from "../finance/finance.repository";
import { CUSTOMER_TYPES } from "@/modules/customer/customer.types";
import { CustomerRepository } from "@/modules/customer/customer.repository";
import { DebtTypeEnum, ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { Request } from "express";
import dayjs from "dayjs";

interface IDebt extends Customer {
  beginningDebt: number;
  debtIncrease: number;
  debtDecrease: number;
  endingDebt: number;
}

@injectable()
export class DebtRepository extends BaseRepository<Debt> {
  protected entityClass = Debt;
  protected selectedFields = DebtSelectFull;
  protected relations = DebtRelations;
  protected multipleFile: boolean = true;
  protected timeField: keyof Debt = "timeAt";

  constructor(
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
  ) {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Debt> | undefined): void {
    this.selectedFields = selectedFields || DebtSelectFull;
    this.relations = DebtRelations;
  }

  async findWithPagination(
    options: DebtQueryDto,
    manager?: EntityManager,
    includeDeleted?: boolean,
    req?: Request,
  ): Promise<{ data: any[]; total: number; summary?: any }> {
    const startAt = options.startAt || dayjs("2026-01-01").tz("Asia/Ho_Chi_Minh").toDate();
    const endAt = options.endAt || dayjs().tz("Asia/Ho_Chi_Minh").add(1, "month").toDate();
    const page = options.page || 1;
    const size = options.size || 20;
    const offset = (page - 1) * size;
    const keyword = options.keyword ? options.keyword : null;

    let rows: any[] = [];

    if (keyword) {
      const result = await this.customerRepository.findWithPagination({
        page: options.page,
        size: options.size,
        keyword: options.keyword,
      });

      const customerIds = result.data.map((customer) => customer.id);

      // If no customers found, return empty result
      if (customerIds.length === 0) {
        return { data: [], total: 0 };
      }

      const qb = this.customerRepository.getRepository().createQueryBuilder("customer");

      qb.where("customer.id IN (:...customerIds)", { customerIds });

      // Bảng debt có lưu các bản ghi công nợ với khách hàng, trong đó phân biệt bằng type : RECEIVABLE và PAYABLE (công nợ phải thu và công nợ phải trả)
      // Bảng finance lưu các khoản thu chi, trong đó có liên quan đến công nợ khách hàng (chỉ lấy các khoản thu chi liên quan đến khách hàng)
      // Lấy số dư công nợ ban đầu của khách hàng tại bảng Customer : openingDebt , cộng thêm số này với tồn ban đàu và tồn cuối
      // tồn khoản công nợ đầu kỳ = tổng công nợ phải thu - tổng công nợ phải trả  - tổng khoản đã thu + tổng khoản đã chi (trước ngày bắt đầu)
      // tăng công nợ trong kỳ = tổng công nợ phải thu - tổng công nợ phải trả (trong kỳ)
      // giảm công nợ trong kỳ = tổng đã thu + tổng đã chi (trong kỳ)
      // tồn khoản công nợ cuối kỳ = tổng công nợ phải thu - tổng công nợ phải trả  - tổng khoản đã thu + tổng khoản đã chi (trước ngày kết thúc)

      // Subquery 1: tổng biến động công nợ (debt) trước kỳ — tách riêng để tránh mất dữ liệu khi không có debt nhưng có finance
      qb.addSelect((subQuery) => {
        return subQuery
          .select(
            `COALESCE(SUM(CASE WHEN d.type = '${DebtTypeEnum.RECEIVABLE}' THEN d.amount ELSE 0 END), 0) -
           COALESCE(SUM(CASE WHEN d.type = '${DebtTypeEnum.PAYABLE}' THEN d.amount ELSE 0 END), 0)`,
            "debtBeforeStart",
          )
          .from(Debt, "d")
          .where("d.customerId = customer.id")
          .andWhere('d."timeAt" < :startAt', { startAt })
          .andWhere("d.deletedAt IS NULL");
      }, "debtBeforeStart");

      // Subquery 2: tổng biến động thu/chi công nợ (finance) trước kỳ — tách riêng để không bị mất khi không có debt
      qb.addSelect((subQuery) => {
        return subQuery
          .select(
            `COALESCE(SUM(CASE WHEN f.type = '${FinanceTypeEnum.INCOME}' AND f."isDebtRelated" = true THEN f.amount ELSE 0 END), 0) -
           COALESCE(SUM(CASE WHEN f.type = '${FinanceTypeEnum.EXPENSE}' AND f."isDebtRelated" = true THEN f.amount ELSE 0 END), 0)`,
            "financeBeforeStart",
          )
          .from(Finance, "f")
          .where("f.customerId = customer.id")
          .andWhere('f."timeAt" < :startAt', { startAt })
          .andWhere(`f.status = '${ExpenseApprovalStatusEnum.APPROVED}'`)
          .andWhere("f.deletedAt IS NULL");
      }, "financeBeforeStart");

      qb.addSelect((subQuery) => {
        return subQuery
          .select(
            `COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.RECEIVABLE}' THEN debt.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.PAYABLE}' THEN debt.amount ELSE 0 END), 0)`,
            "debtIncrease",
          )
          .from(Debt, "debt")
          .where("debt.customerId = customer.id")
          .andWhere('debt."timeAt" BETWEEN :startAt AND :endAt', { startAt, endAt });
      }, "debtIncrease");

      qb.addSelect((subQuery) => {
        return subQuery
          .select(
            `COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.INCOME}' AND finance.isDebtRelated = true AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.EXPENSE}' AND finance.isDebtRelated = true AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN finance.amount ELSE 0 END), 0)`,
            "debtDecrease",
          )
          .from(Finance, "finance")
          .where("finance.customerId = customer.id")
          .andWhere('finance."timeAt" BETWEEN :startAt AND :endAt', { startAt, endAt });
      }, "debtDecrease");

      rows = await qb.getRawAndEntities().then((res) => {
        return res.entities.map((entity) => {
          const entityId = (entity as any).id;
          const raw = res.raw.find((r) => r.customer_id === entityId || r.id === entityId);
          if (!raw) {
            return {
              ...entity,
              beginningDebt: (entity as any).openingDebt || 0,
              debtIncrease: 0,
              debtDecrease: 0,
              endingDebt: (entity as any).openingDebt || 0,
            } as IDebt;
          }
          const openingDebt = (entity as any).openingDebt || 0;
          const debtBeforeStart = parseFloat(raw.debtBeforeStart) || 0;
          const financeBeforeStart = parseFloat(raw.financeBeforeStart) || 0;
          const beginningDebt = openingDebt + debtBeforeStart - financeBeforeStart;
          const debtIncrease = parseFloat(raw.debtIncrease) || 0;
          const debtDecrease = parseFloat(raw.debtDecrease) || 0;
          return {
            ...entity,
            beginningDebt,
            debtIncrease,
            debtDecrease,
            endingDebt: beginningDebt + debtIncrease - debtDecrease,
          } as IDebt;
        });
      });
    } else {
      // Dùng CTE + window function để tính endingDebt, filter != 0, paginate và đếm total trong 1 query duy nhất
      rows = await this.customerRepository.getRepository().query(
        `
      WITH customer_debt AS (
        SELECT
          c.id,
          c.code,
          c.name,
          c.phone,
          c.address,
          c.avatar,
          c."zaloName",
          COALESCE(c."openingDebt", 0) AS "openingDebt",
          -- tổng biến động công nợ trước kỳ
          COALESCE((
            SELECT SUM(CASE WHEN d.type = '${DebtTypeEnum.RECEIVABLE}' THEN d.amount ELSE 0 END)
                 - SUM(CASE WHEN d.type = '${DebtTypeEnum.PAYABLE}' THEN d.amount ELSE 0 END)
            FROM debts d
            WHERE d."customerId" = c.id AND d."deletedAt" IS NULL AND d."timeAt" < $1
          ), 0) AS "debtBeforeStart",
          -- tổng thu/chi công nợ trước kỳ
          COALESCE((
            SELECT SUM(CASE WHEN f.type = '${FinanceTypeEnum.INCOME}' AND f."isDebtRelated" = true THEN f.amount ELSE 0 END)
                 - SUM(CASE WHEN f.type = '${FinanceTypeEnum.EXPENSE}' AND f."isDebtRelated" = true THEN f.amount ELSE 0 END)
            FROM finances f
            WHERE f."customerId" = c.id AND f."isDebtRelated" = true AND f.status = '${ExpenseApprovalStatusEnum.APPROVED}' AND f."deletedAt" IS NULL AND f."timeAt" < $1
          ), 0) AS "financeBeforeStart",
          -- tăng công nợ trong kỳ
          COALESCE((
            SELECT SUM(CASE WHEN d.type = '${DebtTypeEnum.RECEIVABLE}' THEN d.amount ELSE 0 END)
                 - SUM(CASE WHEN d.type = '${DebtTypeEnum.PAYABLE}' THEN d.amount ELSE 0 END)
            FROM debts d
            WHERE d."customerId" = c.id AND d."deletedAt" IS NULL AND d."timeAt" BETWEEN $1 AND $2
          ), 0) AS "debtIncrease",
          -- giảm công nợ trong kỳ
          COALESCE((
            SELECT SUM(CASE WHEN f.type = '${FinanceTypeEnum.INCOME}' AND f."isDebtRelated" = true AND f.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN f.amount ELSE 0 END)
                 - SUM(CASE WHEN f.type = '${FinanceTypeEnum.EXPENSE}' AND f."isDebtRelated" = true AND f.status = '${ExpenseApprovalStatusEnum.APPROVED}' THEN f.amount ELSE 0 END)
            FROM finances f
            WHERE f."customerId" = c.id AND f."isDebtRelated" = true AND f."deletedAt" IS NULL AND f."timeAt" BETWEEN $1 AND $2
          ), 0) AS "debtDecrease"
        FROM customers c
        WHERE c."deletedAt" IS NULL
          AND ($3::text IS NULL OR c.name ILIKE $3 OR c.phone ILIKE $3 OR c.code ILIKE $3)
      ),
      computed AS (
        SELECT *,
          ("openingDebt" + "debtBeforeStart" - "financeBeforeStart") AS "beginningDebt",
          ("openingDebt" + "debtBeforeStart" - "financeBeforeStart" + "debtIncrease" - "debtDecrease") AS "endingDebt"
        FROM customer_debt
      )
      SELECT *, COUNT(*) OVER() AS total
      FROM computed
      WHERE "endingDebt" != 0
      ORDER BY "endingDebt" DESC
      LIMIT $4 OFFSET $5
      `,
        [startAt, endAt, keyword, size, offset],
      );

      if (!rows.length) {
        return { data: [], total: 0 };
      }
    }

    const total = parseInt(rows[0].total) || 0;
    const data = rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      phone: row.phone,
      address: row.address,
      avatar: row.avatar,
      zaloName: row.zaloName,
      beginningDebt: parseFloat(row.beginningDebt) || 0,
      debtIncrease: parseFloat(row.debtIncrease) || 0,
      debtDecrease: parseFloat(row.debtDecrease) || 0,
      endingDebt: parseFloat(row.endingDebt) || 0,
    }));

    return { data, total };
  }

  async getDebtByCustomerId(
    id: string,
    data: DebtQueryDto,
    manager?: EntityManager,
    includeDeleted?: boolean,
    req?: Request,
  ): Promise<any> {
    let startAt = data.startAt || dayjs("2026-01-01").tz("Asia/Ho_Chi_Minh").toDate();
    let endAt = data.endAt || dayjs().tz("Asia/Ho_Chi_Minh").add(1, "month").toDate();

    console.log(startAt, endAt);

    // Lấy customer
    const customer = await this.customerRepository.findById(id, manager);
    if (!customer) {
      return null;
    }

    // // tính ngày công nợ sớm nhất của khách hàng
    // const earliestDebt = await this.getRepository(manager)
    //   .createQueryBuilder("debt")
    //   .select("MIN(debt.timeAt)", "earliestDebt")
    //   .where("debt.customerId = :customerId", { customerId: id })
    //   .andWhere("debt.deletedAt IS NULL")
    //   .getRawOne()
    //   .then((res) => res.earliestDebt);

    // // tính ngày thanh toán sớm nhất của khách hàng
    // const earliestFinance = await this.financeRepository
    //   .getRepository(manager)
    //   .createQueryBuilder("finance")
    //   .select("MIN(finance.timeAt)", "earliestFinance")
    //   .where("finance.customerId = :customerId", { customerId: id })
    //   .andWhere("finance.isDebtRelated = true")
    //   .andWhere(`finance.status = '${ExpenseApprovalStatusEnum.APPROVED}'`)
    //   .andWhere("finance.deletedAt IS NULL")
    //   .getRawOne()
    //   .then((res) => res.earliestFinance);

    // console.log("Earliest Debt:", earliestDebt);
    // console.log("Earliest Finance:", earliestFinance);

    // tính công nợ tại thời điểm đầu kỳ
    const beginningDebt = await this.calculateCustomerDebtAtTime(id, startAt, manager);
    const endingDebt = await this.calculateCustomerDebtAtTime(id, endAt, manager);

    //? Lấy danh sách các khoản đã thu từ khách hàng này trong khoảng thời gian, tính công nợ tại thời điểm sau khi trừ các khoản đã thu
    const rawIncomes = await this.financeRepository
      .getRepository()
      .createQueryBuilder("finance")
      .addSelect(
        `(
        SELECT COALESCE(SUM(d.amount), 0)
        FROM debts d
        WHERE d."customerId" = :id
          AND d.type = '${DebtTypeEnum.RECEIVABLE}'
          AND d."deletedAt" IS NULL
          AND d."timeAt" <= finance."timeAt"
      ) - (
        SELECT COALESCE(SUM(f.amount), 0)
        FROM finances f
        WHERE f."customerId" = :id
          AND f.type = '${FinanceTypeEnum.INCOME}'
          AND f."isDebtRelated" = true
          AND f."status" = '${ExpenseApprovalStatusEnum.APPROVED}'
          AND f."deletedAt" IS NULL
          AND f."timeAt" <= finance."timeAt"
      )
       + :openingDebt    
      `,
        "remainingDebt",
      )
      .leftJoinAndSelect("finance.order", "order")
      .where("finance.customerId = :customerId", { customerId: id })
      .andWhere('finance."timeAt" BETWEEN :startAt AND :endAt', { startAt, endAt })
      .andWhere("finance.type = :type", { type: FinanceTypeEnum.INCOME })
      .andWhere("finance.isDebtRelated = true")
      .andWhere("finance.status = :status", { status: ExpenseApprovalStatusEnum.APPROVED })
      .andWhere("finance.deletedAt IS NULL")
      .setParameter("id", id)
      .setParameter("openingDebt", customer.openingDebt || 0)
      .getRawAndEntities();

    // Map remainingDebt vào từng finance record (order đã được hydrate qua relation path)
    const incomes = rawIncomes.entities.map((entity) => {
      const entityId = (entity as any).id;
      const raw = rawIncomes.raw.find((r) => r.finance_id === entityId);
      return {
        ...entity,
        remainingDebt: raw ? parseFloat(raw.remainingDebt) || 0 : 0,
      };
    });

    // Dùng relation path "debt.order" để TypeORM hydrate đúng entity, tránh lẫn dữ liệu khách hàng khác
    const rawDebts = await this.getRepository(manager)
      .createQueryBuilder("debt")
      .addSelect(
        `(
        SELECT COALESCE(SUM(d.amount), 0)
        FROM debts d
        WHERE d."customerId" = :id
          AND d.type = '${DebtTypeEnum.RECEIVABLE}'
          AND d."deletedAt" IS NULL
          AND d."timeAt" <= debt."timeAt"
      ) - (
        SELECT COALESCE(SUM(f.amount), 0)
        FROM finances f
        WHERE f."customerId" = :id
          AND f.type = '${FinanceTypeEnum.INCOME}'
          AND f."isDebtRelated" = true
          AND f."status" = '${ExpenseApprovalStatusEnum.APPROVED}'
          AND f."deletedAt" IS NULL
          AND f."timeAt" <= debt."timeAt"
      )
        + :openingDebt    
      `,
        "remainingDebt",
      )

      // Dùng relation path thay vì entity class trực tiếp để TypeORM hydrate đúng và không lẫn dữ liệu
      .leftJoinAndSelect("debt.order", "order")
      .where("debt.customerId = :customerId", { customerId: id })
      .andWhere('debt."timeAt" BETWEEN :startAt AND :endAt', { startAt, endAt })
      .andWhere("debt.deletedAt IS NULL")
      .setParameter("id", id)
      .setParameter("openingDebt", customer.openingDebt || 0)
      .getRawAndEntities();

    // Map remainingDebt vào từng debt record (order đã được hydrate qua relation)
    const debts = rawDebts.entities.map((entity) => {
      const entityId = (entity as any).id;
      const raw = rawDebts.raw.find((r) => r.debt_id === entityId);
      return {
        ...entity,
        remainingDebt: raw ? parseFloat((raw as any).remainingDebt) || 0 : 0,
      };
    });

    // Kết hợp incomes và debts, sắp xếp theo thời gian
    const combined = [...incomes, ...debts];
    combined.sort((a, b) => {
      return a.timeAt.getTime() - b.timeAt.getTime();
    });

    return {
      ...customer,
      beginningDebt: beginningDebt,
      debtIncrease: debts.reduce((sum, debt) => sum + debt.amount, 0),
      debtDecrease: incomes.reduce((sum, income) => sum + income.amount, 0),
      endingDebt: endingDebt,
      details: combined,
    };
  }

  //? tính tổng công nợ đầu kỳ, tăng trong kỳ, giảm trong kỳ, cuối kỳ theo điều kiện
  async getDebtSummaryByCondition(
    data: DebtQueryDto,
    manager?: EntityManager,
    includeDeleted?: boolean,
    req?: Request,
  ): Promise<any> {
    // Hiện tại chưa dùng đến filter nào khác ngoài thời gian, nên tạm thời chỉ lấy theo thời gian
    const startAt = data.startAt || dayjs().tz("Asia/Ho_Chi_Minh").startOf("month").toDate();
    const endAt = data.endAt || dayjs().tz("Asia/Ho_Chi_Minh").endOf("month").toDate();

    // Tính tổng số công nợ ban đầu của toàn bộ khách hàng
    const customerOpeningDebt = await this.customerRepository
      .getRepository(manager)
      .createQueryBuilder("customer")
      .select("COALESCE(SUM(customer.openingDebt), 0)", "totalOpeningDebt")
      .where("customer.deletedAt IS NULL")
      .getRawOne()
      .then((res) => parseFloat(res.totalOpeningDebt) || 0);

    const totalBeginningDebt =
      (await this.getRepository(manager)
        .createQueryBuilder("debt")
        .select(
          `COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.RECEIVABLE}' THEN debt.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.PAYABLE}' THEN debt.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.INCOME}' AND finance.isDebtRelated = true AND finance.customerId IS NOT NULL THEN finance.amount ELSE 0 END), 0) +
         COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.EXPENSE}' AND finance.isDebtRelated = true AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' AND finance.customerId IS NOT NULL THEN finance.amount ELSE 0 END), 0)`,
          "totalBeginningDebt",
        )
        .leftJoin(
          Finance,
          "finance",
          `finance.customerId = debt.customerId AND finance."timeAt" < :startAt AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}'`,
          { startAt },
        )
        .where('debt."timeAt" < :startAt', { startAt })
        .andWhere("debt.deletedAt IS NULL")
        .getRawOne()
        .then((res) => parseFloat(res.totalBeginningDebt) || 0)) + customerOpeningDebt;

    const totalIncrease = await this.getRepository(manager)
      .createQueryBuilder("debt")
      .select(
        `COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.RECEIVABLE}' THEN debt.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.PAYABLE}' THEN debt.amount ELSE 0 END), 0)`,
        "totalIncrease",
      )
      .where('debt."timeAt" BETWEEN :startAt AND :endAt', { startAt, endAt })
      .andWhere("debt.deletedAt IS NULL")
      .getRawOne()
      .then((res) => parseFloat(res.totalIncrease) || 0);

    const totalDecrease = await this.financeRepository
      .getRepository(manager)
      .createQueryBuilder("finance")
      .select(
        `COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.INCOME}' AND finance.isDebtRelated = true AND finance.customerId IS NOT NULL THEN finance.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.EXPENSE}' AND finance.isDebtRelated = true AND finance.status = '${ExpenseApprovalStatusEnum.APPROVED}' AND finance.customerId IS NOT NULL THEN finance.amount ELSE 0 END), 0)`,
        "totalDecrease",
      )
      .where('finance."timeAt" BETWEEN :startAt AND :endAt', { startAt, endAt })
      .andWhere("finance.status = :status", { status: ExpenseApprovalStatusEnum.APPROVED })
      .andWhere("finance.deletedAt IS NULL")
      .getRawOne()
      .then((res) => parseFloat(res.totalDecrease) || 0);

    const totalEndingDebt = totalBeginningDebt + totalIncrease - totalDecrease;

    return {
      totalBeginningDebt,
      totalIncrease,
      totalDecrease,
      totalEndingDebt,
    };
  }

  //? xóa công nợ của khách hàng khi xóa hợp đồng liên quan đến công nợ đó.
  async deleteFromOrder(orderId: string, manager?: EntityManager): Promise<void> {
    const debt = await this.getRepository(manager).findOne({
      where: {
        orderId,
      },
    });

    if (!debt) {
      return;
    }

    //? xóa cứng bản ghi
    await this.getRepository(manager).delete(debt.id);
  }

  // tính công nợ khách hàng tại thời điểm timeAt (strict <, dùng cho beginningDebt đầu kỳ)
  async calculateCustomerDebtAtTime(customerId: string, timeAt: Date, manager?: EntityManager): Promise<number> {
    // Tách riêng debt và finance để tránh mất dữ liệu finance khi không có debt row nào trước timeAt
    const debtAmount = await this.getRepository(manager)
      .createQueryBuilder("debt")
      .select(
        `COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.RECEIVABLE}' THEN debt.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN debt.type = '${DebtTypeEnum.PAYABLE}' THEN debt.amount ELSE 0 END), 0)`,
        "debtAmount",
      )
      .where("debt.customerId = :customerId", { customerId })
      .andWhere('debt."timeAt" < :timeAt', { timeAt })
      .andWhere("debt.deletedAt IS NULL")
      .getRawOne()
      .then((res) => parseFloat(res.debtAmount) || 0);

    const financeAmount = await this.financeRepository
      .getRepository(manager)
      .createQueryBuilder("finance")
      .select(
        `COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.INCOME}' AND finance."isDebtRelated" = true THEN finance.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN finance.type = '${FinanceTypeEnum.EXPENSE}' AND finance."isDebtRelated" = true THEN finance.amount ELSE 0 END), 0)`,
        "financeAmount",
      )
      .where("finance.customerId = :customerId", { customerId })
      .andWhere('finance."timeAt" < :timeAt', { timeAt })
      .andWhere(`finance.status = '${ExpenseApprovalStatusEnum.APPROVED}'`)
      .andWhere("finance.deletedAt IS NULL")
      .getRawOne()
      .then((res) => parseFloat(res.financeAmount) || 0);

    const customerOpeningDebt = await this.customerRepository
      .getRepository(manager)
      .createQueryBuilder("customer")
      .select("customer.openingDebt", "openingDebt")
      .where("customer.id = :customerId", { customerId })
      .andWhere("customer.deletedAt IS NULL")
      .getRawOne()
      .then((res) => parseFloat(res.openingDebt) || 0);

    return customerOpeningDebt + debtAmount - financeAmount;
  }
}
