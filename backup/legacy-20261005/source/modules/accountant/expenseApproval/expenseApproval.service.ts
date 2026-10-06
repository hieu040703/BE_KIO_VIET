import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ExpenseApprovalRepository } from "./expenseApproval.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { EXPENSE_APPROVAL_TYPES } from "./expenseApproval.types";
import { COMMON_TYPES } from "../../common/common.types";
import { ExpenseApprovalRelations, ExpenseApprovalSelectFull } from "./expenseApproval.select";
import { ExpenseApproval } from "@/database/models/ExpenseApproval";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { CreateTimeKeepingDto } from "@/modules/timeKeeping/timeKeeping.validator";
import {
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  MarginStatusEnum,
  OtherAmountTypeEnum,
  TimeKeepingTypeEnum,
} from "@/shared/constants/constance";
import { BadRequestError } from "@/shared/types/errors";
import { IEntityManager, ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { ExpenseApprovalQueryDto } from "./expenseApproval.validator";
import { AdvanceEmployeeRepository } from "../advanceEmployee/advanceEmployee.repository";
import { ADVANCE_EMPLOYEE_TYPES } from "../advanceEmployee/advanceEmployee.types";
import { AdvanceSalaryRepository } from "../advanceSalary/advanceSalary.repository";
import { ADVANCE_SALARY_TYPES } from "../advanceSalary/advanceSalary.types";
import { FinanceRepository } from "../finance/finance.repository";
import { FINANCE_TYPES } from "../finance/finance.types";
import { MarginRepository } from "../margin/margin.repository";
import { MARGIN_TYPES } from "../margin/margin.types";
import { TransactionService } from "../transaction/transaction.service";
import { TRANSACTION_TYPES } from "../transaction/transaction.types";
import { Between, In, IsNull } from "typeorm";
import { Request } from "express";
import { CreateExpenseApprovalDto, CreateExpenseApprovalRequestDto } from "./expenseApproval.validator";
import { FinanceService } from "../finance/finance.service";
import { TIME_KEEPING_CONFIRM_TYPES } from "@/modules/timeKeeping/timeKeepingConfirm/timeKeepingConfirm.types";
import { TimeKeepingConfirmRepository } from "@/modules/timeKeeping/timeKeepingConfirm/timeKeepingConfirm.repository";
import { AdvanceEmployeeService } from "../advanceEmployee/advanceEmployee.service";
import { AdvanceSalaryService } from "../advanceSalary/advanceSalary.service";
import { AdvanceEmployeeSelectBasic } from "../advanceEmployee/advanceEmployee.select";
import { EmployeeSelectBasic } from "@/modules/employee/employee.select";
import { AdvanceSalarySelectBasic } from "../advanceSalary/advanceSalary.select";
import { FinanceRelations, FinanceSelectBasic, FinanceSelectFull } from "../finance/finance.select";
import { UserSelectWithEmployee } from "@/modules/user/user.select";

@injectable()
export class ExpenseApprovalService extends BaseService<ExpenseApproval> {
  protected relations = ExpenseApprovalRelations;
  protected selectedFields = ExpenseApprovalSelectFull;
  constructor(
    @inject(EXPENSE_APPROVAL_TYPES.ExpenseApprovalRepository)
    private expenseApprovalRepository: ExpenseApprovalRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(FINANCE_TYPES.FinanceService) private financeService: FinanceService,
    @inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeRepository)
    private advanceEmployeeRepository: AdvanceEmployeeRepository,
    @inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeService) private advanceEmployeeService: AdvanceEmployeeService,
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryRepository) private advanceSalaryRepository: AdvanceSalaryRepository,
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryService) private advanceSalaryService: AdvanceSalaryService,
    @inject(MARGIN_TYPES.MarginRepository) private marginRepository: MarginRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(TRANSACTION_TYPES.TransactionService) private transactionService: TransactionService,
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository)
    private timeKeepingConfirmRepository: TimeKeepingConfirmRepository,
  ) {
    super(expenseApprovalRepository);
  }

  //? Lấy các khoản chờ phê duyệt theo hướng thu hoặc chi.
  async getAllExpenses(
    data: ExpenseApprovalQueryDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<any[]>> {
    if (data.direction === FinanceTypeEnum.INCOME) {
      const pendingIncomes = await this.financeRepository.findByOptions(
        {
          where: {
            type: FinanceTypeEnum.INCOME,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
          select: FinanceSelectFull,
          relations: FinanceRelations,
          order: { timeAt: "DESC" },
        },
        manager,
      );

      const incomes = pendingIncomes.filter((income) => Boolean(income.customerId || income.orderId));

      return ApiResponseHandler.getSuccess("OK", {
        incomes,
        salaries: [],
        expenses: [],
        advanceEmployees: [],
        advanceSalaries: [],
      });
    }

    // const startAt = data.startAt ? dayjs(data.startAt).toDate() : dayjs().startOf("months").toDate();
    // const endAt = data.endAt ? dayjs(data.endAt).toDate() : dayjs().endOf("month").toDate();

    // console.log("startAt - endAt", startAt, endAt);

    // các khoản chi lương
    const salaries = await this.financeRepository.findByOptions(
      {
        where: {
          type: FinanceTypeEnum.SALARY,
          status: ExpenseApprovalStatusEnum.PENDING,
        },
        select: {
          ...FinanceSelectBasic,
          employee: EmployeeSelectBasic,
          user: UserSelectWithEmployee,
        },
        relations: {
          employee: true,
          user: { employee: true },
        },
      },
      manager,
    );

    // các khoản chi khác
    const expenses = await this.financeRepository.findByOptions(
      {
        where: {
          type: FinanceTypeEnum.EXPENSE,
          // timeAt: Between(startAt, endAt),
          status: ExpenseApprovalStatusEnum.PENDING,
        },
        select: {
          ...FinanceSelectBasic,
          employee: EmployeeSelectBasic,
          user: UserSelectWithEmployee,
        },
        relations: {
          employee: true,
          user: { employee: true },
        },
      },
      manager,
    );

    // các khoản tạm ứng nhân viên
    const advanceEmployees = await this.advanceEmployeeRepository.findByOptions(
      {
        where: {
          type: FinanceTypeEnum.ADVANCE_EMPLOYEE,
          // timeAt: Between(startAt, endAt),
          status: ExpenseApprovalStatusEnum.PENDING,
        },
        select: {
          ...AdvanceEmployeeSelectBasic,
          employee: EmployeeSelectBasic,
          user: UserSelectWithEmployee,
          createdAt: true,
        },
        relations: {
          employee: true,
          user: { employee: true },
        },
      },
      manager,
    );

    // các khoản tạm ứng lương
    const advanceSalaries = await this.advanceSalaryRepository.findByOptions(
      {
        where: {
          type: FinanceTypeEnum.ADVANCE_SALARY,
          // timeAt: Between(startAt, endAt),
          status: ExpenseApprovalStatusEnum.PENDING,
        },
        select: {
          ...AdvanceSalarySelectBasic,
          employee: EmployeeSelectBasic,
          user: UserSelectWithEmployee,
          createdAt: true,
        },
        relations: {
          employee: true,
          user: { employee: true },
        },
      },
      manager,
    );

    return ApiResponseHandler.getSuccess("OK", {
      incomes: [],
      salaries,
      expenses,
      advanceEmployees,
      advanceSalaries,
    });
  }

  async confirmExpenseApproval(
    data: CreateExpenseApprovalRequestDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<void>> {
    const direction = data.direction || FinanceTypeEnum.EXPENSE;
    const incomeIds = data.incomeIds || [];

    if (direction === FinanceTypeEnum.INCOME) {
      if (incomeIds.length === 0) {
        throw new BadRequestError("Không có khoản thu nào để xác nhận");
      }

      if (
        data.salaryIds.length > 0 ||
        data.expenseIds.length > 0 ||
        data.advanceEmployeeIds.length > 0 ||
        data.advanceSalaryIds.length > 0 ||
        data.marginIds.length > 0
      ) {
        throw new BadRequestError("Không thể phê duyệt đồng thời phiếu thu và phiếu chi");
      }
    } else if (incomeIds.length > 0) {
      throw new BadRequestError("Không thể phê duyệt phiếu thu trong quy trình phiếu chi");
    }

    if (
      incomeIds.length === 0 &&
      data.salaryIds.length === 0 &&
      data.expenseIds.length === 0 &&
      data.advanceEmployeeIds.length === 0 &&
      data.advanceSalaryIds.length === 0
    ) {
      throw new BadRequestError("Không có khoản chi tiêu nào để xác nhận");
    }

    const requestedBy = req?.user?.userId;

    if (!requestedBy) {
      throw new BadRequestError("Người yêu cầu không hợp lệ");
    }

    const dataCreate: CreateExpenseApprovalDto = {
      timeAt: new Date(),
      requestedBy: requestedBy,
      isConfirm: false,
      amount: 0,
    };

    const expenseApproval = await this.expenseApprovalRepository.create(dataCreate, manager);

    let totalAmount = 0;

    if (direction === FinanceTypeEnum.INCOME) {
      const selectedIncomes = await this.financeRepository.findByOptions(
        {
          where: {
            id: In(incomeIds),
            type: FinanceTypeEnum.INCOME,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
        },
        manager,
      );

      if (selectedIncomes.length !== incomeIds.length) {
        throw new BadRequestError("Có một số khoản thu không hợp lệ để xác nhận");
      }

      const codes = [...new Set(selectedIncomes.map((income) => income.code))];
      const groupedIncomes = await this.financeRepository.findByOptions(
        {
          where: {
            code: In(codes),
            type: FinanceTypeEnum.INCOME,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
        },
        manager,
      );

      if (groupedIncomes.some((income) => !income.customerId && !income.orderId)) {
        throw new BadRequestError("Chỉ phiếu thu liên quan khách hàng/đơn hàng mới được phê duyệt");
      }

      for (const income of groupedIncomes) {
        await this.financeService.update(
          income.id,
          { expenseApprovalId: expenseApproval.id, status: ExpenseApprovalStatusEnum.APPROVED },
          req,
          manager,
        );
      }

      totalAmount += groupedIncomes.reduce((sum, income) => sum + income.amount, 0);

      await this.expenseApprovalRepository.update(expenseApproval.id, { amount: totalAmount }, manager);

      return ApiResponseHandler.createSuccess("Xác nhận khoản thu thành công", expenseApproval);
    }

    // xác nhận các khoản chi lương
    if (data.salaryIds.length > 0) {
      const salaries = await this.financeRepository.findByOptions(
        {
          where: {
            id: In(data.salaryIds),
            type: FinanceTypeEnum.SALARY,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
        },
        manager,
      );

      if (salaries.length !== data.salaryIds.length) {
        throw new Error("Có một số khoản chi lương không hợp lệ để xác nhận");
      }

      for (const salary of salaries) {
        await this.financeService.update(
          salary.id,
          { expenseApprovalId: expenseApproval.id, status: ExpenseApprovalStatusEnum.APPROVED },
          req,
          manager,
        );

        if (salary.timeKeepingConfirmId) {
          await this.timeKeepingConfirmRepository.updatePaidStatus(salary.timeKeepingConfirmId, manager);
        }
      }

      totalAmount += salaries.reduce((sum, salary) => sum + salary.amount, 0);
    }

    // xác nhận các khoản chi khác
    if (data.expenseIds.length > 0) {
      const expenses = await this.financeRepository.findByOptions(
        {
          where: {
            id: In(data.expenseIds),
            type: FinanceTypeEnum.EXPENSE,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
        },
        manager,
      );

      if (expenses.length !== data.expenseIds.length) {
        throw new Error("Có một số khoản chi tiêu không hợp lệ để xác nhận");
      }

      for (const expense of expenses) {
        await this.financeService.update(
          expense.id,
          { expenseApprovalId: expenseApproval.id, status: ExpenseApprovalStatusEnum.APPROVED },
          req,
          manager,
        );

        // tương thích dữ liệu lương cũ từng lưu type=EXPENSE
        if (expense.timeKeepingConfirmId) {
          await this.timeKeepingConfirmRepository.updatePaidStatus(expense.timeKeepingConfirmId, manager);
        }
      }

      totalAmount += expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }

    // xác nhận các khoản tạm ứng nhân viên
    if (data.advanceEmployeeIds.length > 0) {
      const advanceEmployees = await this.advanceEmployeeRepository.findByOptions(
        {
          where: { id: In(data.advanceEmployeeIds), status: ExpenseApprovalStatusEnum.PENDING },
        },
        manager,
      );

      if (advanceEmployees.length !== data.advanceEmployeeIds.length) {
        throw new Error("Có một số khoản tạm ứng nhân viên không hợp lệ để xác nhận");
      }

      await this.advanceEmployeeRepository.updateOptions(
        { expenseApprovalId: expenseApproval.id, status: ExpenseApprovalStatusEnum.APPROVED },
        { id: In(data.advanceEmployeeIds) },
        manager,
      );

      await Promise.all(
        advanceEmployees.map(async (advanceEmployee) => {
          await this.transactionService.createTransactionFromAdvanceEmployee(advanceEmployee, manager);
        }),
      );

      totalAmount += advanceEmployees.reduce((sum, advanceEmployee) => sum + advanceEmployee.amount, 0);
    }

    // xác nhận các khoản tạm ứng lương
    if (data.advanceSalaryIds.length > 0) {
      const advanceSalaries = await this.advanceSalaryRepository.findByOptions(
        {
          where: { id: In(data.advanceSalaryIds), status: ExpenseApprovalStatusEnum.PENDING },
        },
        manager,
      );

      if (advanceSalaries.length !== data.advanceSalaryIds.length) {
        throw new Error("Có một số khoản tạm ứng lương không hợp lệ để xác nhận");
      }
      await this.advanceSalaryRepository.updateOptions(
        { expenseApprovalId: expenseApproval.id, status: ExpenseApprovalStatusEnum.APPROVED },
        { id: In(data.advanceSalaryIds) },
        manager,
      );

      await Promise.all(
        advanceSalaries.map(async (advanceSalary) => {
          await this.transactionService.createTransactionFromAdvanceSalary(advanceSalary, manager);

          //? tạo 1 khoản phải thu khác bên bảng lương
          const dataCreateTimeKeeping: CreateTimeKeepingDto = {
            type: TimeKeepingTypeEnum.IN, // nhân viên tạm ứng lương nên là khoản thu
            employeeId: advanceSalary.employeeId!,
            timeAt: advanceSalary.timeAt,
            otherAmount: advanceSalary.amount,
            otherAmountType: OtherAmountTypeEnum.ADVANCE_SALARY,
            advanceSalaryId: advanceSalary.id,
            note: advanceSalary.note,
          };

          await this.timeKeepingRepository.create(dataCreateTimeKeeping, manager);
        }),
      );

      totalAmount += advanceSalaries.reduce((sum, advanceSalary) => sum + advanceSalary.amount, 0);
    }

    // cập nhật lại tổng số tiền phê duyệt
    await this.expenseApprovalRepository.update(expenseApproval.id, { amount: totalAmount }, manager);

    return ApiResponseHandler.createSuccess("Xác nhận khoản chi tiêu thành công", expenseApproval);
  }

  async rejectExpenseApproval(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const expenseApproval = await this.expenseApprovalRepository.findById(id, manager);

    if (!expenseApproval) {
      throw new BadRequestError("Yêu cầu phê duyệt khoản chi tiêu không tồn tại");
    }

    // get all finance, advanceEmployee, advanceSalary, margin by expenseApprovalId
    const expenses = await this.financeRepository.findByOptions(
      {
        where: {
          expenseApprovalId: expenseApproval.id,
          type: In([FinanceTypeEnum.INCOME, FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY]),
        },
      },
      manager,
    );

    const advanceEmployees = await this.advanceEmployeeRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id },
      },
      manager,
    );

    const advanceSalaries = await this.advanceSalaryRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id },
      },
      manager,
    );

    // reject các khoản chi tiêu
    if (expenses.length > 0) {
      await this.financeRepository.updateOptions(
        { expenseApprovalId: null, status: null },
        { id: In(expenses.map((e) => e.id)) },
        manager,
      );
    }

    // reject các khoản tạm ứng nhân viên
    if (advanceEmployees.length > 0) {
      await this.advanceEmployeeRepository.updateOptions(
        { expenseApprovalId: null, status: null },
        { id: In(advanceEmployees.map((e) => e.id)) },
        manager,
      );
    }

    // reject các khoản tạm ứng lương
    if (advanceSalaries.length > 0) {
      await this.advanceSalaryRepository.updateOptions(
        { expenseApprovalId: null, status: null },
        { id: In(advanceSalaries.map((e) => e.id)) },
        manager,
      );
    }

    return ApiResponseHandler.createSuccess("Từ chối khoản chi tiêu thành công");
  }

  async getExpenseApprovalById(
    id: string,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<ExpenseApproval>> {
    const expenseApproval = await this.expenseApprovalRepository.findById(id, manager);

    if (!expenseApproval) {
      throw new BadRequestError("Yêu cầu phê duyệt khoản chi tiêu không tồn tại");
    }

    // get chi khác by expenseApprovalId
    const expenses = await this.financeRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id, type: FinanceTypeEnum.EXPENSE },
      },
      manager,
    );

    // get chi lương by expenseApprovalId
    const salaries = await this.financeRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id, type: FinanceTypeEnum.SALARY },
      },
      manager,
    );

    const incomes = await this.financeRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id, type: FinanceTypeEnum.INCOME },
      },
      manager,
    );

    const advanceEmployees = await this.advanceEmployeeRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id },
      },
      manager,
    );

    const advanceSalaries = await this.advanceSalaryRepository.findByOptions(
      {
        where: { expenseApprovalId: expenseApproval.id },
      },
      manager,
    );

    return ApiResponseHandler.createSuccess("Lấy thông tin yêu cầu phê duyệt khoản chi tiêu thành công", {
      ...expenseApproval,
      incomes,
      expenses,
      salaries,
      advanceEmployees,
      advanceSalaries,
    });
  }

  async deleteItemFromExpenseApproval(
    financeId: string,
    type: FinanceTypeEnum,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<void>> {
    console.log();
    if (
      type === FinanceTypeEnum.INCOME ||
      type === FinanceTypeEnum.EXPENSE ||
      type === FinanceTypeEnum.SALARY
    ) {
      await this.financeService.delete(financeId, req, manager);
    } else if (type === FinanceTypeEnum.ADVANCE_EMPLOYEE) {
      await this.advanceEmployeeService.delete(financeId, req, manager);
    } else {
      await this.advanceSalaryService.delete(financeId, req, manager);
    }
    return ApiResponseHandler.deleteSuccess("OK");
  }
}
