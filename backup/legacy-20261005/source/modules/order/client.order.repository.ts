import { Order } from "@/database/models/Order";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { injectable, inject } from "inversify";
import { TransactionRepository } from "../accountant/transaction/transaction.repository";
import { TRANSACTION_TYPES } from "../accountant/transaction/transaction.types";
import { OrderSelectFull, OrderRelations, OrderSelectBasic } from "./order.select";
import DatabaseConfig from "@/database/database";
import { FileStatusEnum } from "@/shared/constants/constance";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { In, SelectQueryBuilder } from "typeorm";
import { CustomerSelectBasic } from "../customer/customer.select";
import { EmployeeSelectBasic } from "../employee/employee.select";
import { ClientOrderQueryDto } from "./order.validator";
import { ORDER_COMMENT_TYPES } from "./orderComment/orderComment.types";
import { OrderCommentRepository } from "./orderComment/orderComment.repository";
import { Request, Response } from "express";
import { BadRequestError, ForbiddenError } from "@/shared/types/errors";

@injectable()
export class ClientOrderRepository extends BaseRepository<Order> {
  protected entityClass = Order;
  protected multipleFile: boolean = true;
  protected searchFields: (keyof Order)[] = ["name", "code", "description"];
  protected timeField: keyof Order = "timeAt";
  protected nestedFileFields = ["orderEmployees.employee.avatar"];

  constructor(
    @inject(TRANSACTION_TYPES.TransactionRepository) private transactionRepository: TransactionRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentRepository) private orderCommentRepository: OrderCommentRepository,
  ) {
    super();
    this.setOptions(OrderSelectBasic, OrderRelations);
  }

  // protected async extendQueryBuilder(
  //   qb: SelectQueryBuilder<Order>,
  //   options: IFindOptions<Order>,
  //   req?: Request,
  // ): Promise<void> {
  //   const customerId = req?.user?.customerId || req?.query?.customerId;
  //   console.log("vao day", customerId);
  //   if (!customerId) {
  //     throw new ForbiddenError("Bạn không có quyền truy cập đơn hàng");
  //   }

  //   qb.andWhere("entity.customerId = :customerId", { customerId });
  // }

  // for client use
  async getFileInAllOrderByCustomer(
    customerId: string,
    data: ClientOrderQueryDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<{ data: any[]; total: number }> {
    const result = await this.findWithPagination(
      {
        ...data,
        page: data.page || 1,
        size: data.size || 20,
        where: {
          customerId: customerId,
        },
        select: {
          ...OrderSelectBasic,
          customer: CustomerSelectBasic,
          orderEmployees: {
            id: true,
            employeeId: true,
            employee: EmployeeSelectBasic,
          },
        },
        relations: {
          customer: true,
          orderEmployees: {
            employee: true,
          },
        },
      },
      manager,
      false,
      req,
    );

    // Collect tất cả employeeId từ orderEmployees để batch-load avatar
    const allEmployeeIds = new Set<string>();
    for (const order of result.data) {
      for (const oe of order.orderEmployees || []) {
        if (oe.employeeId) allEmployeeIds.add(oe.employeeId);
      }
    }

    // Batch query avatar files cho tất cả employees trong 1 lần
    const avatarsByEmployeeId: Record<string, any[]> = {};
    const attachmentsByEmployeeId: Record<string, any[]> = {};

    if (allEmployeeIds.size > 0) {
      const fileRepo = DatabaseConfig.getRepository("File");
      const avatarFiles = await fileRepo.find({
        where: {
          entityId: In([...allEmployeeIds]),
          category: "avatar",
          status: FileStatusEnum.ACTIVE,
          deletedAt: null,
        } as any,
        order: { createdAt: "ASC" } as any,
      });

      const attachments = await fileRepo.find({
        where: {
          entityId: In([...allEmployeeIds]),
          category: "attachment",
          status: FileStatusEnum.ACTIVE,
          deletedAt: null,
        } as any,
        order: { createdAt: "ASC" } as any,
      });

      for (const f of avatarFiles) {
        const eid = (f as any).entityId;
        if (!avatarsByEmployeeId[eid]) avatarsByEmployeeId[eid] = [];
        avatarsByEmployeeId[eid].push(f);
      }

      for (const f of attachments) {
        const eid = (f as any).entityId;
        if (!attachmentsByEmployeeId[eid]) attachmentsByEmployeeId[eid] = [];
        attachmentsByEmployeeId[eid].push(f);
      }
    }

    const resDate = await Promise.all(
      result.data.map(async (order) => {
        const fileInOrderComments = await this.orderCommentRepository.getAllFileAttachments(order.id, manager);

        const orderEmployeeWithAvatar = (order.orderEmployees || []).map((oe: any) => ({
          ...oe,
          employee: oe.employee
            ? {
                ...oe.employee,
                avatar: avatarsByEmployeeId[oe.employeeId] || [],
                attachment: attachmentsByEmployeeId[oe.employeeId] || [],
              }
            : oe.employee,
        }));

        return {
          id: order.id,
          code: order.code,
          name: order.name,
          status: order.status,
          customer: order.customer,
          amount: order.amount,
          timeAt: order.timeAt,
          employees: orderEmployeeWithAvatar.map((oe) => oe.employee),
          totalIncomeAmount: order["totalIncomeAmount"],
          attachment: [...(order["attachment"] || []), ...(fileInOrderComments || [])],
        };
      }),
    );

    return {
      data: resDate,
      total: result.total,
    };
  }

  async getTotalOrdersByCustomer(customerId: string, manager?: IEntityManager): Promise<number> {
    const count = await this.count(
      {
        customerId: customerId,
      },
      manager,
    );
    return count;
  }
}
