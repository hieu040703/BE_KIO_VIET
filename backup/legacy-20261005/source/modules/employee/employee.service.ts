import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { EmployeeRepository } from "./employee.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { EMPLOYEE_TYPES } from "./employee.types";
import { COMMON_TYPES } from "../common/common.types";
import { Employee } from "@/database/models/Employee";
import { EmployeeRelations, EmployeeSelectFull } from "./employee.select";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { CommonService } from "../common/common.service";
import { CreateEmployeeDto, UpdateEmployeeDto } from "./employee.validator";
import { AttributeTypeEnum, EmployeeStatusType, FinanceTypeEnum } from "@/shared/constants/constance";
import { TIME_KEEPING_TYPES } from "../timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "../timeKeeping/timeKeeping.repository";
import { FINANCE_TYPES, FinanceCreationSourceEnum } from "../accountant/finance/finance.types";
import { FinanceService } from "../accountant/finance/finance.service";
import { Request } from "express";
import { ATTRIBUTE_TYPES } from "../attribute/attribute.types";
import { AttributeService } from "../attribute/attribute.service";
import { BRANCH_TYPES } from "../branch/branch.types";
import { BranchRepository } from "../branch/branch.repository";

@injectable()
export class EmployeeService extends BaseService<Employee> {
  protected relations = EmployeeRelations;
  protected selectedFields = EmployeeSelectFull;
  constructor(
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(FINANCE_TYPES.FinanceService) private financeService: FinanceService,
    @inject(ATTRIBUTE_TYPES.AttributeService) private attributeService: AttributeService,
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
  ) {
    super(employeeRepository);
  }

  async validateBeforeCreate(data: CreateEmployeeDto, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.commonService.validateUniquePhone(data.phone, "employee", undefined, manager);

    if (!data.code) {
      const code = await this.commonService.getCode("Employee");
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.employeeRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã nhân viên đã tồn tại");
      }
    }
  }

  async actionAfterCreate(data: Employee, req?: Request, manager?: IEntityManager): Promise<void> {
    const employee = await this.employeeRepository.findById(data.id, manager);

    if (!employee) {
      throw new BadRequestError("Nhân viên không tồn tại");
    }

    if (employee.position) {
      const attributeExist = await this.attributeService.checkExistNameAndType(
        employee.position,
        AttributeTypeEnum.POSITION,
        manager,
      );

      if (!attributeExist) {
        await this.attributeService.create({ name: employee.position, type: AttributeTypeEnum.POSITION }, req, manager);
      }
    }
  }

  async validateBeforeUpdate(
    id: string,
    data: UpdateEmployeeDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(id, manager);
    if (!existingEmployee) {
      throw new NotFoundError("Nhân viên không tồn tại");
    }

    if (data.code && data.code !== existingEmployee.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.employeeRepository.fieldExistsExcludingId("code", data.code, id, manager);
      if (codeExists) {
        throw new BadRequestError("Mã nhân viên đã được sử dụng");
      }
    }

    if (data.phone !== undefined) {
      await this.commonService.validateUniquePhone(data.phone, "employee", id, manager);
    }
  }

  async actionAfterUpdate(data: Employee, req?: Request, manager?: IEntityManager): Promise<void> {
    if (data.status === EmployeeStatusType.INACTIVE) {
      await this.collectUnpaidSalary(data, req, manager);
    }

    if (data.position) {
      const attributeExist = await this.attributeService.checkExistNameAndType(
        data.position,
        AttributeTypeEnum.POSITION,
        manager,
      );
      if (!attributeExist) {
        await this.attributeService.create({ name: data.position, type: AttributeTypeEnum.POSITION }, req, manager);
      }
    }
  }

  async actionAfterDelete(data: Employee, req?: Request, manager?: IEntityManager): Promise<void> {
    const branchAssignedEmployee = await this.branchRepository.exists({ employeeId: data.id } as any, manager);

    if (branchAssignedEmployee) {
      await this.branchRepository.updateOptions({ employeeId: null }, { employeeId: data.id } as any, manager);
    }
  }

  /**
   * Tìm employee từ userId (ID tài khoản người dùng)
   * @param userId - ID của user
   * @returns Promise<{ statusCode: number; data: Employee | null; message: string }>
   */
  async findByUserId(userId: string): Promise<{ statusCode: number; data: Employee | null; message: string }> {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      return {
        statusCode: 404,
        data: null,
        message: "Không tìm thấy nhân viên với userId này",
      };
    }

    return {
      statusCode: 200,
      data: employee,
      message: "Tìm thấy nhân viên",
    };
  }

  private async collectUnpaidSalary(employee: Employee, req?: Request, manager?: IEntityManager): Promise<void> {
    // 1. Tìm tất cả TimeKeeping chưa thanh toán của nhân viên
    const unpaidTimeKeepings = await this.timeKeepingRepository.findByOptions(
      {
        where: {
          employeeId: employee.id,
          isPaid: false,
          isCollected: false,
        },
      },
      manager,
    );

    if (!unpaidTimeKeepings || unpaidTimeKeepings.length === 0) return;

    // 2. Tính tổng lương chưa thanh toán
    const totalUnpaidSalary = unpaidTimeKeepings.reduce((sum, tk) => sum + (tk.salary || 0), 0);

    if (totalUnpaidSalary <= 0) return;

    // 3. Tạo khoản thu Finance loại INCOME
    const finance = await this.financeService.create(
      {
        employeeId: employee.id,
        branchId: employee.branchId,
        type: FinanceTypeEnum.INCOME,
        amount: totalUnpaidSalary,
        category: "Thu lương nhân viên nghỉ việc",
        timeAt: new Date(),
        note: `Thu lại lương chưa thanh toán của nhân viên ${employee.name} (${employee.code}) khi nghỉ việc`,
      },
      req,
      manager,
      FinanceCreationSourceEnum.SYSTEM,
    );

    // 4. Đánh dấu các TimeKeeping là đã thu (isCollected = true)
    const unpaidIds = unpaidTimeKeepings.map((tk) => tk.id);
    await this.timeKeepingRepository.updateMany(
      unpaidIds,
      {
        isCollected: true,
        // incomeId: finance.data.id
      },
      manager,
    );
  }
}
