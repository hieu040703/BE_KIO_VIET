import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { BranchRepository } from "./branch.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { BRANCH_TYPES } from "./branch.types";
import { COMMON_TYPES } from "../common/common.types";
import { Branch } from "@/database/models/Branch";
import { BranchRelations, BranchSelectFull } from "./branch.select";
import { CreateBranchDto } from "./branch.validator";
import { Request } from "express";
import { CommonService } from "../common/common.service";
import { IEntityManager } from "@/shared/types/interfaces";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";

@injectable()
export class BranchService extends BaseService<Branch> {
  protected relations = BranchRelations;
  protected selectedFields = BranchSelectFull;
  constructor(
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
  ) {
    super(branchRepository);
  }

  async validateBeforeCreate(data: CreateBranchDto, req: Request): Promise<void> {
    // Add your validation logic here
    if (!data.code) {
      const code = await this.commonService.getCode("Branch");
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.branchRepository.fieldExists("code", data.code);
      if (codeExists) {
        throw new BadRequestError("Mã chi nhánh đã tồn tại");
      }
    }
  }

  async actionAfterCreate(data: Branch, req?: Request, manager?: IEntityManager): Promise<void> {
    // nếu có employeeId => cập nhật employee.branchId = data.id
    if (data.employeeId) {
      await this.employeeRepository.update(data.employeeId, { branchId: data.id }, manager);
    }
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<Branch>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingBranch = await this.branchRepository.findById(id);
    if (!existingBranch) {
      throw new NotFoundError("Chi nhánh không tồn tại");
    }

    if (data.code && data.code !== existingBranch.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.branchRepository.fieldExistsExcludingId("code", data.code, id);
      if (codeExists) {
        throw new BadRequestError("Mã chi nhánh đã được sử dụng");
      }
    }
  }

  async actionAfterUpdate(data: Branch, req?: Request, manager?: IEntityManager): Promise<void> {
    // nếu có employeeId => cập nhật employee.branchId = data.id
    if (data.employeeId) {
      await this.employeeRepository.update(data.employeeId, { branchId: data.id }, manager);
    }
  }
}
