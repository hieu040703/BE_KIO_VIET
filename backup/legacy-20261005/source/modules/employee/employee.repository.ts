import { BaseRepository } from "@/shared/base/BaseRepository";
import { Employee } from "@/database/models/Employee";
import { Brackets, EntityManager, FindOptionsSelect, In, IsNull, Not, SelectQueryBuilder } from "typeorm";
import { EmployeeSelectFull, EmployeeRelations, EmployeeSelectLite } from "./employee.select";
import { injectable, inject } from "inversify";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { EmployeeStatusType, OrderStatusEnum, UserRoleEnum } from "@/shared/constants/constance";
import { EmployeeQueryDto } from "./employee.validator";
import { ORDER_EMPLOYEE_TYPES } from "../order/orderEmployee/orderEmployee.types";
import { OrderEmployeeRepository } from "../order/orderEmployee/orderEmployee.repository";
import { Branch } from "@/database/models/Branch";
import { BranchSelectBasic } from "../branch/branch.select";
import { UserSelectBasic } from "../user/user.select";
import {
  calculateEstimatedAvailableHours,
  EmployeeEstimatedCompletionRow,
  getLatestEstimatedCompletionAtByEmployeeId,
} from "./employee.availability";

@injectable()
export class EmployeeRepository extends BaseRepository<Employee> {
  protected entityClass = Employee;
  protected selectedFields = EmployeeSelectFull;
  protected relations = EmployeeRelations;

  constructor(
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository) private orderEmployeeRepository: OrderEmployeeRepository,
  ) {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<Employee> | undefined): void {
    this.selectedFields = selectedFields || EmployeeSelectFull;
    this.relations = EmployeeRelations;
  }

  private normalizeRemainingSalary(employee: Employee | null): Employee | null {
    if (!employee) {
      return null;
    }

    const normalizedSalary = Number((employee as any).remainingSalary);

    (employee as any).remainingSalary = Number.isFinite(normalizedSalary) ? normalizedSalary : 0;

    return employee;
  }

  private async findEstimatedCompletionTimes(
    employeeIds: string[],
    manager?: EntityManager,
  ): Promise<Map<string, Date>> {
    if (employeeIds.length === 0) {
      return new Map();
    }

    const rows = await this.orderEmployeeRepository
      .getRepository(manager)
      .createQueryBuilder("order_employee")
      .innerJoin("orders", "processing_order", '"processing_order"."id" = "order_employee"."orderId"')
      .select('"order_employee"."employeeId"', "employeeId")
      .addSelect('"processing_order"."estimatedCompletionAt"', "estimatedCompletionAt")
      .where('"order_employee"."employeeId" IN (:...employeeIds)', { employeeIds })
      .andWhere('"order_employee"."deletedAt" IS NULL')
      .andWhere('"processing_order"."deletedAt" IS NULL')
      .andWhere('"processing_order"."status" = :processingStatus', {
        processingStatus: OrderStatusEnum.PROCESSING,
      })
      .andWhere('"processing_order"."estimatedCompletionAt" IS NOT NULL')
      .getRawMany<EmployeeEstimatedCompletionRow>();

    return getLatestEstimatedCompletionAtByEmployeeId(rows);
  }

  async findById(
    id: number | string,
    manager?: EntityManager,
    includeDeleted: boolean = false,
    req?: Request,
  ): Promise<Employee | null> {
    const employee = await super.findById(id, manager, includeDeleted, req);
    return this.normalizeRemainingSalary(employee);
  }

  async findEmployeeByPhone(phone: string): Promise<Employee | null> {
    const emp = await this.getRepository().findOne({
      where: {
        phone,
      },
      select: {
        id: true,
        name: true,
        zaloName: true,
        phone: true,
        user: UserSelectBasic,
      },
      relations: {
        user: true,
      },
    });

    return emp;
  }

  /**
   * Tìm employee từ userId (ID tài khoản người dùng)
   * @param userId - ID của user
   * @param manager - EntityManager tùy chọn
   * @returns Employee hoặc null nếu không tìm thấy
   */
  async findByUserId(userId: string, manager?: EntityManager): Promise<Employee | null> {
    const emp = await this.findByOption({
      where: {
        user: {
          id: userId,
        },
      },
      select: {
        id: true,
        name: true,
        zaloName: true,
        phone: true,
        user: {
          id: true,
        },
      },
      relations: {
        user: true,
      },
    });

    console.log(emp);

    if (!emp) {
      return null;
    }

    return emp;
  }

  protected async extendSummaryFields(
    summary: any,
    qb: SelectQueryBuilder<Employee>,
    options: EmployeeQueryDto,
  ): Promise<void> {
    qb.expressionMap.wheres = qb.expressionMap.wheres.filter(
      (where) => !String(where.condition).includes("entity.status"),
    );

    const all = await qb.getCount();
    summary.all = all;

    // Đếm số nhân viên đang làm việc
    const activeCount = await qb
      .clone()
      .andWhere("entity.status = :status", { status: EmployeeStatusType.ACTIVE })
      .getCount();
    summary.activeCount = activeCount;

    // Đếm số nhân viên nghỉ việc
    const inactiveCount = await qb
      .clone()
      .andWhere("entity.status = :status", { status: EmployeeStatusType.INACTIVE })
      .getCount();
    summary.inactiveCount = inactiveCount;

    // Đếm số nhân viên tạm nghỉ
    const onLeaveCount = await qb
      .clone()
      .andWhere("entity.status = :status", { status: EmployeeStatusType.ON_LEAVE })
      .getCount();
    summary.onLeaveCount = onLeaveCount;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<Employee>,
    options: EmployeeQueryDto,
    req?: Request,
  ): Promise<void> {
    // Lấy tất cả nhân viên, bao gồm cả những người chưa có tài khoản
    // Loại bỏ chỉ những nhân viên có tài khoản ADMIN
    const existingJoin = qb.expressionMap.joinAttributes.find((join) => join.alias.name === "user");
    if (!existingJoin) {
      qb.leftJoin("entity.user", "user");
    }
    // Chỉ loại trừ những nhân viên có user.role = ADMIN
    // Giữ lại những nhân viên chưa có user (user IS NULL) hoặc có user nhưng không phải ADMIN
    qb.andWhere("(user.role IS NULL OR user.role != :role)", { role: UserRoleEnum.ADMIN });

    if (options.isWorking !== undefined) {
      console.log("options", options.isWorking);
      if (options.isWorking) {
        qb.andWhere("(entity.isWorking = :isWorking)", { isWorking: true });
      } else {
        qb.andWhere("(entity.isWorking = :isWorking)", { isWorking: false });
      }
    }

    if (options.branchIds && options.branchIds.length > 0) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: options.branchIds });
    }

    if (options.managerIds && options.managerIds.length > 0) {
      qb.andWhere("entity.managerId IN (:...managerIds)", { managerIds: options.managerIds });
    }

    if (options.recruiterIds && options.recruiterIds.length > 0) {
      qb.andWhere("entity.recruiterId IN (:...recruiterIds)", { recruiterIds: options.recruiterIds });
    }

    if (options.position) {
      qb.andWhere("entity.position = :position", { position: options.position });
    }

    if (options.statuses && options.statuses.length > 0) {
      qb.andWhere("entity.status IN (:...statuses)", { statuses: options.statuses });
    }

    //? lấy thêm thông tin tiền lương còn lại mỗi nhân viên, = tổng tiền lương của các TimeKeeping chưa thanh toán và có salary > 0  (isPaid = false & salary > 0) - tổng otherAmount của timeKeeping có advanceSalaryId khác null (otherAmount > 0 & advanceSalaryId IS NOT NULL) trong tháng hiện tại
    qb.addSelect((subQb) => {
      return subQb
        .select(
          "COALESCE(SUM(tk.salary), 0) - COALESCE(SUM(CASE WHEN tk.advanceSalaryId IS NOT NULL THEN tk.otherAmount ELSE 0 END), 0)",
          "remainingSalary",
        )
        .from("time_keepings", "tk")
        .where("tk.employeeId = entity.id")
        .andWhere("tk.isPaid = false")
        .andWhere("tk.isCollected = false")
        .andWhere("tk.salary > 0");
      // .andWhere("DATE_TRUNC('month', tk.timeAt) = DATE_TRUNC('month', CURRENT_DATE)");
    }, "remainingSalary");

    //? Lọc theo khoảng thời gian ngay vào làm
    // if (options.startAt && options.endAt) {
    //   qb.andWhere("entity.startDate BETWEEN :startAt AND :endAt", {
    //     startAt: options.startAt,
    //     endAt: options.endAt,
    //   });
    // }
  }

  /**
   * Override findWithPagination hoàn toàn để tránh TypeORM identity map corruption.
   *
   * PATTERN:
   *   Step 1 — raw query: lấy IDs + count + summary (có filter/pagination/sort)
   *   Step 2 — find(): load Employee entities sạch bằng `find({ id: In(ids) })`
   *             TypeORM `find()` dùng code path riêng, không bị identity map bug
   *             của `getRawAndEntities()`.
   *   Step 3 — load branch/manager/recruiter riêng bằng separate queries.
   *   Step 4 — attachFiles.
   */
  async findWithPagination(
    options: EmployeeQueryDto,
    manager?: EntityManager,
    includeDeleted = false,
    req?: Request,
  ): Promise<{ data: Employee[]; total: number; summary?: any }> {
    const page = options.page || 1;
    const size = options.size || 20;
    const repo = this.getRepository(manager);

    // ---- Bước 1: Build query để lấy IDs và count ----
    const qb = repo.createQueryBuilder("entity");
    qb.select("entity.id", "id");

    // leftJoin user để filter ADMIN (không select)
    qb.leftJoin("entity.user", "user");
    qb.andWhere("(user.role IS NULL OR user.role != :role)", { role: UserRoleEnum.ADMIN });

    // Không bao gồm deleted
    if (!includeDeleted) {
      qb.andWhere("entity.deletedAt IS NULL");
    }

    // Apply options từ EmployeeQueryDto
    const empOptions = options as EmployeeQueryDto;

    if (empOptions.isWorking !== undefined) {
      qb.andWhere("entity.isWorking = :isWorking", { isWorking: empOptions.isWorking });
    }
    if (empOptions.isManager === true) {
      //? Chỉ lấy nhân viên đang là quản lý chi nhánh: có Branch.employeeId = entity.id, chưa soft-delete.
      qb.andWhere(
        `entity.id IN (
          SELECT "branch"."employeeId"
          FROM "branches" "branch"
          WHERE "branch"."employeeId" IS NOT NULL
            AND "branch"."deletedAt" IS NULL
        )`,
      );
    }
    if (empOptions.excludeManager === true) {
      //? Loại trừ nhân viên đang là quản lý chi nhánh (branches.employeeId), chưa soft-delete.
      qb.andWhere(
        `entity.id NOT IN (
          SELECT "branch"."employeeId"
          FROM "branches" "branch"
          WHERE "branch"."employeeId" IS NOT NULL
            AND "branch"."deletedAt" IS NULL
        )`,
      );
    }
    if (empOptions.branchIds && empOptions.branchIds.length > 0) {
      qb.andWhere("entity.branchId IN (:...branchIds)", { branchIds: empOptions.branchIds });
    }
    if (empOptions.managerIds && empOptions.managerIds.length > 0) {
      qb.andWhere("entity.managerId IN (:...managerIds)", { managerIds: empOptions.managerIds });
    }
    if (empOptions.recruiterIds && empOptions.recruiterIds.length > 0) {
      qb.andWhere("entity.recruiterId IN (:...recruiterIds)", { recruiterIds: empOptions.recruiterIds });
    }
    if (options.status !== undefined) {
      qb.andWhere("entity.status = :status", { status: options.status });
    }

    if (options.statuses && options.statuses.length > 0) {
      qb.andWhere("entity.status IN (:...statuses)", { statuses: options.statuses });
    }

    // Hỗ trợ truyền `where` tùy ý (TypeORM FindOptionsWhere) để filter linh hoạt.
    // VD: `where: { status: Not(EmployeeStatusType.INACTIVE) }` hoặc `where: { id: In([...]) }`.
    // Áp dụng bằng andWhere để KHÔNG ghi đè các filter ở trên (ADMIN, isWorking, …).
    const rawWhere = (options as any).where;
    if (rawWhere) {
      const whereConditions = Array.isArray(rawWhere) ? rawWhere : [rawWhere];
      qb.andWhere(
        new Brackets((subQb) => {
          whereConditions.forEach((condition, index) => {
            if (index === 0) subQb.where(condition as any);
            else subQb.orWhere(condition as any);
          });
        }),
      );
    }

    if (options.keyword) {
      qb.andWhere(
        new Brackets((qb1) => {
          ["name", "code", "phone", "zaloName", "email"].forEach((field, idx) => {
            const condition = `unaccent(LOWER("entity"."${field}"::text)) ILIKE unaccent(LOWER(:keyword))`;
            if (idx === 0) qb1.where(condition, { keyword: `%${options.keyword}%` });
            else qb1.orWhere(condition, { keyword: `%${options.keyword}%` });
          });
        }),
      );
    }

    //? Lọc theo khoảng thời gian ngay vào làm
    if (options.startAt && options.endAt) {
      qb.andWhere("entity.startDate BETWEEN :startAt AND :endAt", {
        startAt: options.startAt,
        endAt: options.endAt,
      });
    }

    if (options.position) {
      qb.andWhere("entity.position = :position", { position: options.position });
    }

    //? lấy thêm thông tin tiền lương còn lại mỗi nhân viên, = tổng tiền lương của các TimeKeeping chưa thanh toán và có salary > 0  (isPaid = false & salary > 0) - tổng otherAmount của timeKeeping có advanceSalaryId khác null (otherAmount > 0 & advanceSalaryId IS NOT NULL) trong tháng hiện tại
    qb.addSelect((subQb) => {
      return subQb
        .select(
          "COALESCE(SUM(CASE WHEN tk.salary > 0 THEN tk.salary ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN tk.advanceSalaryId IS NOT NULL THEN tk.otherAmount ELSE 0 END), 0)",
          "remainingSalary",
        )
        .from("time_keepings", "tk")
        .where("tk.employeeId = entity.id")
        .andWhere("tk.isPaid = false")
        .andWhere("tk.isCollected = false");
      // .andWhere("DATE_TRUNC('month', tk.timeAt) = DATE_TRUNC('month', CURRENT_DATE)");
    }, "remainingSalary");

    // Summary
    let summary: any = {};
    await this.extendSummaryFields(summary, qb.clone() as any, empOptions);

    // Sort
    if (options.sortBy && options.sortOrder) {
      qb.orderBy(`entity.${options.sortBy}`, options.sortOrder.toUpperCase() as "ASC" | "DESC");
    } else {
      qb.orderBy("entity.createdAt", "DESC");
    }

    // Clone trước khi getCount() vì TypeORM mutate qb.expressionMap.select thành COUNT(*)
    // Sau khi getCount() chạy, qb không còn SELECT entity.id nữa → clone sẽ sai
    const countQb = qb.clone();
    const idsQb = qb.clone();

    const total = await countQb.getCount();
    const rawIds = await idsQb
      .offset((page - 1) * size)
      .limit(size)
      .getRawMany();

    if (rawIds.length === 0) {
      return { data: [], total, summary: Object.keys(summary).length > 0 ? summary : undefined };
    }

    const ids: string[] = rawIds.map((r) => r.id);

    // ---- Bước 2: Load Employee entities sạch (không có bất kỳ join nào) ----
    const employeeMap = new Map<string, Employee>();
    const employees = await repo.find({
      where: { id: In(ids) },
      select: EmployeeSelectFull as any,
    });
    // transformEntitiesTypes: TypeORM tự cast varchar chứa số thành number → cần convert lại thành string
    const transformedEmployees = this.transformEntitiesTypes(employees);
    transformedEmployees.forEach((e: any) => employeeMap.set(e.id, e));

    // Giữ thứ tự theo IDs từ query gốc
    let data: any[] = ids.map((id) => employeeMap.get(id)).filter(Boolean);

    // Chèn thêm remainingSalary từ query gốc vào data
    data = data.map((emp) => {
      const raw = rawIds.find((r) => r.id === emp.id);
      return this.normalizeRemainingSalary({
        ...emp,
        remainingSalary: raw?.remainingSalary,
      } as Employee) as Employee;
    });

    const estimatedCompletionTimes = await this.findEstimatedCompletionTimes(ids, manager);
    const now = new Date();
    data = data.map((emp) => ({
      ...emp,
      estimatedAvailableHours: calculateEstimatedAvailableHours(estimatedCompletionTimes.get(emp.id), now),
    }));

    // ---- Bước 3: Load branch/manager/recruiter riêng ----
    const branchIds = [...new Set(data.map((e) => e.branchId).filter(Boolean))] as string[];
    if (branchIds.length > 0) {
      const branchRepo = this.dataSource.getRepository(Branch);
      const branches = await branchRepo.find({
        where: { id: In(branchIds) },
        select: BranchSelectBasic as any,
      });
      // Transform varchar columns (e.g. hotline) bị TypeORM cast thành number → convert lại string
      const branchMetadata = branchRepo.metadata;
      branches.forEach((b) => {
        branchMetadata.columns.forEach((col) => {
          const prop = col.propertyName as keyof Branch;
          if (
            prop in b &&
            b[prop] !== null &&
            b[prop] !== undefined &&
            (col.type === "varchar" || col.type === "text" || col.type === "char") &&
            typeof b[prop] === "number"
          ) {
            (b as any)[prop] = String(b[prop]);
          }
        });
      });
      const branchMap = new Map(branches.map((b) => [b.id, b]));
      data.forEach((emp) => {
        emp.branch = emp.branchId ? (branchMap.get(emp.branchId) ?? null) : null;
      });
    }

    const managerIds = [...new Set(data.map((e) => e.managerId).filter(Boolean))] as string[];
    const recruiterIds = [...new Set(data.map((e) => e.recruiterId).filter(Boolean))] as string[];
    const allRelatedIds = [...new Set([...managerIds, ...recruiterIds])];
    if (allRelatedIds.length > 0) {
      const relatedEmployees = await repo.find({
        where: { id: In(allRelatedIds) },
        select: EmployeeSelectLite as any,
      });
      const transformedRelated = this.transformEntitiesTypes(relatedEmployees);
      const relatedMap = new Map(transformedRelated.map((e: any) => [e.id, e]));
      data.forEach((emp) => {
        emp.manager = emp.managerId ? (relatedMap.get(emp.managerId) ?? null) : null;
        emp.recruiter = emp.recruiterId ? (relatedMap.get(emp.recruiterId) ?? null) : null;
      });
    }

    // ---- Bước 4: Attach files ----
    if (this.enableFileAttachment) {
      data = await this.attachFilesToEntities(data as Employee[]);
    }

    return {
      data,
      total,
      summary: Object.keys(summary).length > 0 ? summary : undefined,
    };
  }

  async getEmployeeBySalary(startAt: Date, endAt: Date): Promise<Employee[]> {
    const result = await this.getRepository()
      .createQueryBuilder("employee")
      .leftJoin("employee.timeKeepingConfirms", "timeKeepingConfirms")
      .where("timeKeepingConfirms.timeAt BETWEEN :startAt AND :endAt", { startAt, endAt })
      .addSelect("COALESCE(SUM(timeKeepingConfirms.totalSalary), 0)", "totalSalary")
      .groupBy("employee.id")
      .orderBy("COALESCE(SUM(timeKeepingConfirms.totalSalary), 0)", "DESC")
      .limit(10)
      .getRawAndEntities();

    // Map totalSalary vào entity
    return result.entities.map((employee, index) => {
      (employee as any).totalSalary = parseFloat(result.raw[index].totalSalary) || 0;
      return employee;
    });
  }

  async updateEmployeeStatus(employeeId: string, manager?: IEntityManager): Promise<void> {
    // đếm số lượng đơn hàng có nhân viên này tham gia và đang trong trạng thái "Đang xử lý"
    const processingOrdersCount = await this.orderEmployeeRepository.count(
      {
        employeeId: employeeId,
        startTime: Not(IsNull()),
        endTime: IsNull(),
      },
      manager,
    );

    console.log("so luong don nhan vien dang tham gia:", processingOrdersCount);

    await this.update(employeeId, { isWorking: processingOrdersCount > 0 }, manager);
  }

  async updateEmployeeStatuses(employeeIds: string[], manager?: IEntityManager): Promise<void> {
    const uniqueEmployeeIds = [...new Set(employeeIds)];
    if (uniqueEmployeeIds.length === 0) {
      return;
    }

    const executor = manager ?? this.getRepository().manager;
    await executor.query(
      `
        UPDATE "employees" AS employee
        SET
          "isWorking" = EXISTS (
            SELECT 1
            FROM "order_employees" AS order_employee
            WHERE order_employee."employeeId" = employee."id"
              AND order_employee."startTime" IS NOT NULL
              AND order_employee."endTime" IS NULL
              AND order_employee."deletedAt" IS NULL
          ),
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE employee."id" = ANY($1::uuid[])
          AND employee."deletedAt" IS NULL
      `,
      [uniqueEmployeeIds],
    );
  }

  async updateAllEmployeeStatus(manager?: IEntityManager): Promise<void> {
    // Lấy tất cả nhân viên
    const employees = await this.findAll(manager);

    // Cập nhật trạng thái cho từng nhân viên
    for (const employee of employees) {
      await this.updateEmployeeStatus(employee.id, manager);
    }
  }

  async updateEmployeeStatusByOrder(orderId: string, manager?: IEntityManager): Promise<void> {
    // Lấy tất cả nhân viên tham gia vào đơn hàng này
    const orderEmployees = await this.orderEmployeeRepository.findByOptions(
      {
        where: { orderId },
        select: ["employeeId"],
      },
      manager,
    );

    await this.updateEmployeeStatuses(
      orderEmployees.map((orderEmployee) => orderEmployee.employeeId),
      manager,
    );
  }
}
