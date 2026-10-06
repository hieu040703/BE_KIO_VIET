import {
  CustomerCare,
  CustomerCareStatus,
} from "@/database/models/CustomerCare";
import { BaseService } from "@/shared/base/BaseService";
import { IEntityManager } from "@/shared/types/interfaces";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { Request } from "express";
import { inject, injectable } from "inversify";
import { DeepPartial } from "typeorm";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";
import { CustomerCareRepository } from "./customerCare.repository";
import {
  CustomerCareRelations,
  CustomerCareSelectFull,
} from "./customerCare.select";
import { CUSTOMER_CARE_TYPES } from "./customerCare.types";

@injectable()
export class AdminCustomerCareService extends BaseService<CustomerCare> {
  protected relations = CustomerCareRelations;
  protected selectedFields = CustomerCareSelectFull;

  constructor(
    @inject(CUSTOMER_CARE_TYPES.CustomerCareRepository)
    private customerCareRepository: CustomerCareRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository)
    private customerRepository: CustomerRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository)
    private employeeRepository: EmployeeRepository,
  ) {
    super(customerCareRepository);
  }

  private async validateAndNormalize(
    data: DeepPartial<CustomerCare>,
    manager?: IEntityManager,
  ): Promise<void> {
    if (
      !data.customerId ||
      !(await this.customerRepository.findById(data.customerId, manager))
    ) {
      throw new NotFoundError("Khách hàng không tồn tại");
    }

    if (
      !data.employeeId ||
      !(await this.employeeRepository.findById(data.employeeId, manager))
    ) {
      throw new NotFoundError("Nhân viên chăm sóc không tồn tại");
    }

    if (!data.scheduledAt) {
      throw new BadRequestError("Thời gian dự kiến là bắt buộc");
    }

    const scheduledAt = new Date(data.scheduledAt as Date);
    const nextFollowUpAt = data.nextFollowUpAt
      ? new Date(data.nextFollowUpAt as Date)
      : null;

    if (nextFollowUpAt && nextFollowUpAt.getTime() <= scheduledAt.getTime()) {
      throw new BadRequestError(
        "Thời gian chăm sóc tiếp theo phải sau thời gian dự kiến",
      );
    }

    if (data.status === CustomerCareStatus.COMPLETED) {
      data.completedAt = data.completedAt
        ? new Date(data.completedAt as Date)
        : new Date();
    } else {
      data.completedAt = null;
    }
  }

  async validateBeforeCreate(
    data: DeepPartial<CustomerCare>,
    _req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    await this.validateAndNormalize(data, manager);
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<CustomerCare>,
    _req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existing = await this.customerCareRepository.findById(id, manager);
    if (!existing) {
      throw new NotFoundError("Lịch sử chăm sóc không tồn tại");
    }

    const merged = { ...existing, ...data };
    await this.validateAndNormalize(merged, manager);
    data.completedAt = merged.completedAt;
  }
}
