import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { FinanceRepository } from "./finance.repository";
import { FINANCE_TYPES } from "./finance.types";
import { Finance } from "@/database/models/Finance";
import { FinanceRelations, FinanceSelectFull } from "./finance.select";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { Request } from "express";
import { CreateFinanceDto, FinanceQueryDto } from "./finance.validator";
import { BadRequestError } from "@/shared/types/errors";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TRANSACTION_TYPES } from "../transaction/transaction.types";
import { TransactionRepository } from "../transaction/transaction.repository";
import { TransactionService } from "../transaction/transaction.service";
import { ATTRIBUTE_TYPES } from "@/modules/attribute/attribute.types";
import { AttributeService } from "@/modules/attribute/attribute.service";
import {
  AttributeTypeEnum,
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  OrderStatusEnum,
} from "@/shared/constants/constance";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { OrderRepository } from "@/modules/order/order.repository";
import { ORDER_COMMENT_TYPES } from "@/modules/order/orderComment/orderComment.types";
import { OrderCommentService } from "@/modules/order/orderComment/orderComment.service";
import { CreateOrderCommentDto } from "@/modules/order/orderComment/orderComment.validator";
import { TIME_KEEPING_CONFIRM_TYPES } from "@/modules/timeKeeping/timeKeepingConfirm/timeKeepingConfirm.types";
import { TimeKeepingConfirmRepository } from "@/modules/timeKeeping/timeKeepingConfirm/timeKeepingConfirm.repository";
import { CodeService } from "@/modules/common/code.service";
import { CalculateOrderData } from "@/modules/order/handles/calculate.order";
import { DeepPartial, Not } from "typeorm";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { CUSTOMER_TYPES } from "@/modules/customer/customer.types";
import { CustomerRepository } from "@/modules/customer/customer.repository";
import { DEBT_TYPES } from "../debt/debt.types";
import { DebtRepository } from "../debt/debt.repository";
import dayjs from "dayjs";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { Attribute } from "@/database/models/Attribute";
import { FinanceCreationSourceEnum } from "./finance.types";

@injectable()
export class FinanceService extends BaseService<Finance> {
  protected relations = FinanceRelations;
  protected selectedFields = FinanceSelectFull;

  constructor(
    @inject(COMMON_TYPES.CodeService) private codeService: CodeService,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(ATTRIBUTE_TYPES.AttributeService) private attributeService: AttributeService,
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(TRANSACTION_TYPES.TransactionService) private transactionService: TransactionService,
    @inject(TRANSACTION_TYPES.TransactionRepository) private transactionRepository: TransactionRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentService) private orderCommentService: OrderCommentService,
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository)
    private timeKeepingConfirmRepository: TimeKeepingConfirmRepository,
    @inject(ORDER_TYPES.CalculateOrderData) private calculateOrderData: CalculateOrderData,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
  ) {
    super(financeRepository);
  }

  async validateBeforeCreate(
    data: CreateFinanceDto,
    req?: Request,
    manager?: IEntityManager,
    source: FinanceCreationSourceEnum = FinanceCreationSourceEnum.MANUAL,
  ): Promise<void> {
    // Add your validation logic here
    if (!data.code) {
      if (data.type === FinanceTypeEnum.INCOME) {
        const code = await this.codeService.getCode("Income", manager);
        data.code = code.data.code || "";
      } else {
        const code = await this.codeService.getCode("Expense", manager);
        data.code = code.data.code || "";
      }
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.financeRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }

    data.userId = data.userId || req?.user?.userId;

    if (data.type === FinanceTypeEnum.SALARY) {
      data.isDebtRelated = false;
    }

    if (data.customerId) {
      const customer = await this.customerRepository.findById(data.customerId, manager);
      if (!customer) {
        throw new BadRequestError("Khách hàng không tồn tại");
      }

      console.log("data.orderId", data.orderPayments);

      if (data.orderPayments && data.orderPayments.length > 0) {
        const totalPayment = data.orderPayments.reduce((total, payment) => total + payment.amount, 0);
        if (totalPayment !== data.amount) {
          throw new BadRequestError(
            "Tổng số tiền thanh toán không khớp với tổng số tiền của các khoản thanh toán trong đơn hàng",
          );
        }
        for (const orderPayment of data.orderPayments) {
          const order = await this.orderRepository.findById(orderPayment.orderId, manager);
          if (!order) {
            throw new BadRequestError("Hợp đồng không tồn tại");
          }

          if (order.status === OrderStatusEnum.CANCELED) {
            throw new BadRequestError("Không thể tạo giao dịch cho hợp đồng đã bị huỷ");
          }

          if (data.type === FinanceTypeEnum.INCOME) {
            // xem khách hàng còn nợ bao nhiêu cho đơn hàng này
            const totalPay = await this.orderRepository.getTotalIncomeByOrderId(orderPayment.orderId, manager);

            console.log("số tiền khách đã thanh toán:", totalPay);
            if (orderPayment.amount + totalPay > order.amount) {
              throw new BadRequestError(
                "Số tiền thanh toán đã lớn hơn số tiền khách hàng đang nợ trong hợp đồng, tổng công nợ hiện tại là: " +
                  (order.amount - totalPay).toLocaleString() +
                  " VND",
              );
            }
          }
        }
      } else {
        const customerDebt = await this.debtRepository.calculateCustomerDebtAtTime(
          data.customerId,
          dayjs().tz("Asia/Ho_Chi_Minh").toDate(),
          manager,
        );
        console.log("công nợ khách hàng:", customerDebt);

        // nếu không chọn hợp đồng thì sẽ kiểm tra xem số tiền có lớn hơn tổng công nợ của khách hàng không
        // if (data.type === FinanceTypeEnum.INCOME) {
        //   if (data.amount > customerDebt) {
        //     throw new BadRequestError(
        //       "Số tiền thanh toán đã lớn hơn tổng công nợ của khách hàng, tổng công nợ hiện tại là: " +
        //         customerDebt.toLocaleString() +
        //         " VND",
        //     );
        //   }
        // }
      }
    }

    if (data.type === FinanceTypeEnum.INCOME) {
      const isRelatedToCustomerOrOrder = Boolean(
        data.customerId || data.orderId || (data.orderPayments && data.orderPayments.length > 0),
      );
      data.status =
        source === FinanceCreationSourceEnum.MANUAL && isRelatedToCustomerOrOrder
          ? ExpenseApprovalStatusEnum.PENDING
          : ExpenseApprovalStatusEnum.APPROVED;
    } else {
      if (!data.status) {
        data.status = ExpenseApprovalStatusEnum.PENDING;
      }
    }
  }

  async create(
    data: CreateFinanceDto,
    req?: Request,
    manager?: IEntityManager,
    source: FinanceCreationSourceEnum = FinanceCreationSourceEnum.MANUAL,
  ): Promise<ApiResponse<Finance>> {
    await this.validateBeforeCreate(data, req, manager, source);
    let timePayment = dayjs(data.timeAt);
    if (data.customerId && data.orderPayments && data.orderPayments.length > 0) {
      for (const orderPayment of data.orderPayments) {
        const financeData: CreateFinanceDto = {
          ...data,
          orderId: orderPayment.orderId,
          amount: orderPayment.amount,
          timeAt: timePayment.toDate(),
        };

        timePayment = timePayment.add(1, "second"); // dayjs là immutable, cần gán lại để mỗi giao dịch có thời gian lệch nhau 1 giây
        await this.financeRepository.create(financeData, manager);
      }
    } else {
      await this.financeRepository.create(data, manager);
    }

    await this.actionAfterCreate(data as Finance, req, manager);
    return ApiResponseHandler.createSuccess("OK");
  }

  async actionAfterCreate(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    // lấy finance mới tạo qua code
    const finances = await this.financeRepository.findByOptions(
      {
        where: {
          code: data.code,
        },
      },
      manager,
    );

    if (!finances || finances.length === 0) {
      throw new BadRequestError("Không tìm thấy giao dịch vừa tạo");
    }

    if (finances.length > 0) {
      for (const finance of finances) {
        if (finance.status === ExpenseApprovalStatusEnum.APPROVED) {
          await this.transactionService.createTransactionFromFinance(finance, manager);
        }

        const attributeExist = await this.attributeService.checkExistNameAndType(
          finance.category,
          AttributeTypeEnum.FINANCE,
          manager,
        );
        if (!attributeExist) {
          await this.attributeService.create({ name: finance.category, type: AttributeTypeEnum.FINANCE }, req, manager);
        }

        //? update order status if finance is income
        // isDeposit finance được tạo BỞI calculate.order.ts, nếu gọi lại process() sẽ tạo debt trùng
        //! không gửi thông báo thanh toán vào nhóm chat chung đơn hàng nữa
        // if (
        //   finance.type === FinanceTypeEnum.INCOME &&
        //   finance.orderId &&
        //   finance.status === ExpenseApprovalStatusEnum.APPROVED
        // ) {
        //   await this.calculateOrderData.process(finance.orderId, manager);
        //   const content = finance.isDeposit
        //     ? `Hợp đồng đã nhận được khoản đặt cọc: ${finance.amount.toLocaleString()} VND - Mã giao dịch: ${finance.code}`
        //     : `Hợp đồng đã nhận được khoản thanh toán: ${finance.amount.toLocaleString()} VND - Mã giao dịch: ${finance.code}`;
        //   const dataCreateComment: CreateOrderCommentDto = {
        //     orderId: finance.orderId,
        //     content: content,
        //   };
        //   await this.orderCommentService.create(dataCreateComment, undefined, manager);
        // }
      }
    }
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<Finance>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingFinance = await this.financeRepository.findById(id, manager);
    if (!existingFinance) {
      throw new BadRequestError("Giao dịch không tồn tại");
    }

    if (data.type === FinanceTypeEnum.SALARY || existingFinance.type === FinanceTypeEnum.SALARY) {
      data.isDebtRelated = false;
    }

    if (data.code && data.code !== existingFinance.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.financeRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã giao dịch đã tồn tại");
      }
    }

    if (data.amount && data.amount !== existingFinance.amount) {
      // nếu phiếu đang trong trạng thái chờ duyệt hoặc đã duyệt thì không cho sửa số tiền
      if (
        existingFinance.status === ExpenseApprovalStatusEnum.PENDING ||
        existingFinance.status === ExpenseApprovalStatusEnum.APPROVED
      ) {
        throw new BadRequestError("Không thể sửa số tiền của phiếu đã được duyệt hoặc đang chờ duyệt");
      }
    }
  }

  async syncPendingSalaryAmount(
    timeKeepingConfirmId: string,
    amount: number,
    manager?: IEntityManager,
  ): Promise<void> {
    const salaryFinance = await this.financeRepository.findOne(
      {
        timeKeepingConfirmId,
        type: FinanceTypeEnum.SALARY,
        status: ExpenseApprovalStatusEnum.PENDING,
      },
      manager,
    );

    if (!salaryFinance || salaryFinance.amount === amount) {
      return;
    }

    await this.financeRepository.update(salaryFinance.id, { amount }, manager);
  }

  async actionAfterUpdate(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    console.log("data update", data);
    // nếu phiếu chi đã được duyệt hoặc phiếu thu thì cập nhật giao dịch tương ứng
    if (data.status === ExpenseApprovalStatusEnum.APPROVED) {
      // kiểm tra xem đã tạo giao dịch chưa
      const check = await this.transactionRepository.findOne(
        {
          financeId: data.id,
        },
        manager,
      );

      if (check) {
        await this.transactionService.updateTransactionFromFinance(data, manager);
      } else {
        await this.transactionService.createTransactionFromFinance(data, manager);
      }
    }
    const attributeExist = await this.attributeService.checkExistNameAndType(
      data.category,
      AttributeTypeEnum.FINANCE,
      manager,
    );
    if (!attributeExist) {
      await this.attributeService.create({ name: data.category, type: AttributeTypeEnum.FINANCE }, req, manager);
    }

    //? kiểm tra xem nếu số tiền thanh toán bằng số tiền hợp đồng thì cập nhật trạng thái đã thanh toán cho hợp đồng
    if (data.type === FinanceTypeEnum.INCOME && data.orderId && data.status === ExpenseApprovalStatusEnum.APPROVED) {
      await this.calculateOrderData.process(data.orderId, manager);

      if (data.expenseApprovalId) {
        const content = data.isDeposit
          ? `Hợp đồng đã nhận được khoản đặt cọc: ${data.amount.toLocaleString()} VND - Mã giao dịch: ${data.code}`
          : `Hợp đồng đã nhận được khoản thanh toán: ${data.amount.toLocaleString()} VND - Mã giao dịch: ${data.code}`;
        await this.orderCommentService.create(
          { orderId: data.orderId, content } satisfies CreateOrderCommentDto,
          undefined,
          manager,
        );
      }
    }
  }

  async actionAfterDelete(data: Finance, req?: Request, manager?: IEntityManager): Promise<void> {
    // Xoá giao dịch liên quan
    await this.transactionService.deleteTransactionFromFinance(data, manager);

    // //? kiểm tra xem nếu số tiền thanh toán bằng số tiền hợp đồng thì cập nhật trạng thái đã thanh toán cho hợp đồng
    if (data.type === FinanceTypeEnum.INCOME && data.orderId && data.status === ExpenseApprovalStatusEnum.APPROVED) {
      await this.calculateOrderData.process(data.orderId, manager);
    }

    //? nếu phiếu liên quan đến chi lương cho nhân viên thì gọi service chấm công xóa
    if (data.timeKeepingConfirmId) {
      // phải nullify FK trước để tránh lỗi foreign key khi xóa timeKeepingConfirm
      await this.financeRepository.update(data.id, { timeKeepingConfirmId: null }, manager);
      await this.timeKeepingConfirmRepository.actionAfterDelete(data.timeKeepingConfirmId, req, manager);
      await this.timeKeepingConfirmRepository.delete(data.timeKeepingConfirmId, manager);
    }

    //? Nếu phiếu liên quan đến thu tự động lương của nhân viên khi nghỉ việc thì sẽ cập nhật lại các giờ công này khả dụng để chấm công cho nhân viên
    if (data.employeeId && data.category === "Thu lương nhân viên nghỉ việc") {
      const timeKeepings = await this.timeKeepingRepository.findByOptions(
        {
          where: {
            employeeId: data.employeeId,
            isCollected: true,
            // incomeId: data.id, // tạm thời không check vì chưa ghi incomeId
          },
        },
        manager,
      );

      if (timeKeepings && timeKeepings.length > 0) {
        const timeKeepingIds = timeKeepings.map((tk) => tk.id);
        await this.timeKeepingRepository.updateMany(timeKeepingIds, { isCollected: false, incomeId: null }, manager);
      }
    }
  }

  /**
   * Xóa Finance liên kết với TimeKeepingConfirm mà không kích hoạt xóa ngược
   * TimeKeepingConfirm lần nữa.
   */
  async deleteLinkedTimeKeepingConfirmFinance(id: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const finance = await this.financeRepository.findById(id, manager);
    if (!finance) return;

    if (finance.timeKeepingConfirmId) {
      await this.financeRepository.update(id, { timeKeepingConfirmId: null }, manager);
    }

    await super.delete(id, req, manager);
  }

  async attachMoreDataToSummary(summary: any, options: FinanceQueryDto): Promise<any> {
    if (!summary) {
      summary = {};
    }

    const summaryTypes = options.type
      ? [options.type]
      : options.excludeSalary
        ? [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.INCOME]
        : [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.INCOME, FinanceTypeEnum.SALARY];
    const expenseTypes =
      options.type === FinanceTypeEnum.SALARY
        ? [FinanceTypeEnum.SALARY]
        : options.excludeSalary || options.type === FinanceTypeEnum.EXPENSE
          ? [FinanceTypeEnum.EXPENSE]
          : [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY];

    // Dùng aggregate query thay vì load toàn bộ dữ liệu vào memory (size: 1000000 trước đây gây OOM)
    const queryBuilder = this.financeRepository.getRepository().createQueryBuilder("finance");
    queryBuilder
      .select("SUM(CASE WHEN finance.type = :incomeType THEN finance.amount ELSE 0 END)", "totalIncome")
      .addSelect("SUM(CASE WHEN finance.type IN (:...expenseTypes) THEN finance.amount ELSE 0 END)", "totalExpense")
      .where("finance.status = :status", {
        status: options.status || ExpenseApprovalStatusEnum.APPROVED,
      })
      .andWhere("finance.deletedAt IS NULL")
      .andWhere("finance.type IN (:...summaryTypes)", { summaryTypes })
      .setParameters({
        incomeType: FinanceTypeEnum.INCOME,
        expenseTypes,
      });

    if (options.excludeSalary) {
      queryBuilder.andWhere("finance.type != :excludedSalaryType", {
        excludedSalaryType: FinanceTypeEnum.SALARY,
      });
    }

    if (options.startAt && options.endAt) {
      queryBuilder.andWhere("finance.timeAt BETWEEN :summaryStart AND :summaryEnd", {
        summaryStart: new Date(options.startAt),
        summaryEnd: new Date(options.endAt),
      });
    }

    if (options.branchIds && options.branchIds.length > 0) {
      queryBuilder.andWhere("finance.branchId IN (:...summaryBranchIds)", {
        summaryBranchIds: options.branchIds,
      });
    }

    if (options.customerIds && options.customerIds.length > 0) {
      queryBuilder.andWhere("finance.customerId IN (:...summaryCustomerIds)", {
        summaryCustomerIds: options.customerIds,
      });
    }

    if (options.employeeIds && options.employeeIds.length > 0) {
      queryBuilder.andWhere("finance.employeeId IN (:...summaryEmployeeIds)", {
        summaryEmployeeIds: options.employeeIds,
      });
    }

    if (options.categoryIds && options.categoryIds.length > 0) {
      const categoryNamesSubQuery = queryBuilder
        .subQuery()
        .select("attribute.name")
        .from(Attribute, "attribute")
        .where("attribute.id IN (:...summaryCategoryIds)")
        .getQuery();
      queryBuilder.andWhere(`finance.category IN ${categoryNamesSubQuery}`, {
        summaryCategoryIds: options.categoryIds,
      });
    }

    if (options.keyword) {
      queryBuilder.andWhere(
        "(finance.code ILIKE :summaryKeyword OR finance.note ILIKE :summaryKeyword OR finance.category ILIKE :summaryKeyword)",
        { summaryKeyword: `%${options.keyword}%` },
      );
    }

    const result = await queryBuilder.getRawOne();

    const totalIncome = parseFloat(result?.totalIncome) || 0;
    const totalExpense = parseFloat(result?.totalExpense) || 0;

    return {
      ...summary,
      totalIncome,
      totalExpense,
    };
  }

  async deleteFromOrder(orderId: string, req?: Request, manager?: IEntityManager): Promise<void> {
    const finances = await this.financeRepository.findByOptions(
      {
        where: {
          orderId,
        },
        select: ["id"],
      },
      manager,
    );

    const financeIds = finances.map((finance) => finance.id);
    for (const financeId of financeIds) {
      await this.delete(financeId, req, manager);
    }
  }
}
