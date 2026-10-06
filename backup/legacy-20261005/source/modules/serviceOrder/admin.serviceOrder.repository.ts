import { BaseRepository } from "@/shared/base/BaseRepository";
import { ServiceOrder } from "@/database/models/ServiceOrder";
import { Brackets, FindOptionsSelect, SelectQueryBuilder } from "typeorm";
import { ServiceOrderSelectFull, ServiceOrderRelations } from "./serviceOrder.select";
import { inject, injectable } from "inversify";
import { ServiceOrderStatusEnum, UserRoleEnum } from "@/shared/constants/constance";
import { Request } from "express";
import { ServiceOrderQueryDto } from "./serviceOrder.validator";
import { UnauthorizedError } from "@/shared/types/errors";
import { UserRelations, UserSelectBasic } from "../user/user.select";
import { USER_TYPES } from "../user/user.types";
import { UserRepository } from "../user/user.repository";

@injectable()
export class AdminServiceOrderRepository extends BaseRepository<ServiceOrder> {
  protected entityClass = ServiceOrder;
  protected selectedFields = ServiceOrderSelectFull;
  protected relations = ServiceOrderRelations;

  constructor(@inject(USER_TYPES.UserRepository) private userRepository: UserRepository) {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<ServiceOrder> | undefined): void {
    this.selectedFields = selectedFields || ServiceOrderSelectFull;
    this.relations = ServiceOrderRelations;
  }

  async extendQueryBuilder(
    qb: SelectQueryBuilder<ServiceOrder>,
    options: ServiceOrderQueryDto,
    req?: Request,
  ): Promise<void> {
    if (req) {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Bạn cần đăng nhập để thực hiện hành động này");
      }

      const viewAll = req.user?.viewAll || false;
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

      if (user.role !== UserRoleEnum.ADMIN && !viewAll && user.employeeId) {
        qb.andWhere(
          new Brackets((subQb) => {
            subQb
              .where("entity.employeeId = :employeeId", { employeeId: user.employeeId })
              .orWhere("entity.branchManagerId = :employeeId", { employeeId: user.employeeId });
          }),
        );
      }
    }

    const customerId = options.customerId;
    if (typeof customerId === "string" && customerId.trim().length > 0) {
      qb.andWhere("entity.customerId = :customerId", { customerId });
    }

    if (options.status) {
      qb.andWhere("entity.status = :status", { status: options.status });
    }
  }

  protected async extendSummaryFields(summary: any, qb: SelectQueryBuilder<ServiceOrder>): Promise<void> {
    // Remove status filter so counts cover all statuses
    qb.expressionMap.wheres = qb.expressionMap.wheres.filter(
      (where) => !String(where.condition).includes("entity.status"),
    );

    const countByStatus = async (status: ServiceOrderStatusEnum) =>
      qb.clone().andWhere("entity.status = :s", { s: status }).getCount();

    const [
      all,
      waitingForQuote,
      waitingForCustomerConfirmation,
      waitingForEmployeeConfirmation,
      confirmed,
      processing,
      completedByEmployee,
      completedByCustomer,
      canceled,
    ] = await Promise.all([
      qb.getCount(),
      countByStatus(ServiceOrderStatusEnum.WAITING_FOR_QUOTE),
      countByStatus(ServiceOrderStatusEnum.WAITING_FOR_CUSTOMER_CONFIRMATION),
      countByStatus(ServiceOrderStatusEnum.WAITING_FOR_EMPLOYEE_CONFIRMATION),
      countByStatus(ServiceOrderStatusEnum.CONFIRMED),
      countByStatus(ServiceOrderStatusEnum.PROCESSING),
      countByStatus(ServiceOrderStatusEnum.COMPLETED_BY_EMPLOYEE),
      countByStatus(ServiceOrderStatusEnum.COMPLETED_BY_CUSTOMER),
      countByStatus(ServiceOrderStatusEnum.CANCELED),
    ]);

    summary.all = all;
    summary.waitingForQuoteCount = waitingForQuote;
    summary.waitingForCustomerConfirmationCount = waitingForCustomerConfirmation;
    summary.waitingForEmployeeConfirmationCount = waitingForEmployeeConfirmation;
    summary.confirmedCount = confirmed;
    summary.processingCount = processing;
    summary.completedByEmployeeCount = completedByEmployee;
    summary.completedByCustomerCount = completedByCustomer;
    summary.canceledCount = canceled;
  }
}
