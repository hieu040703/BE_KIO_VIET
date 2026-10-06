import { injectable, inject } from "inversify";
import { FINANCE_TYPES } from "../accountant/finance/finance.types";
import { FinanceRepository } from "../accountant/finance/finance.repository";
import { CodeType } from "@/shared/constants/constance";
import { IEntityManager } from "@/shared/types/interfaces";
import { UserRepository } from "../user/user.repository";
import { BranchRepository } from "../branch/branch.repository";
import { CustomerRepository } from "../customer/customer.repository";
import { EmployeeRepository } from "../employee/employee.repository";
import { OrderRepository } from "../order/order.repository";
import { USER_TYPES } from "../user/user.types";
import { BRANCH_TYPES } from "../branch/branch.types";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { ORDER_TYPES } from "../order/order.types";
import { Like } from "typeorm";
import { DebtRepository } from "../accountant/debt/debt.repository";
import { DEBT_TYPES } from "../accountant/debt/debt.types";
import { MarginRepository } from "../accountant/margin/margin.repository";
import { MARGIN_TYPES } from "../accountant/margin/margin.types";
import { TRANSACTION_TYPES } from "../accountant/transaction/transaction.types";
import { TransactionRepository } from "../accountant/transaction/transaction.repository";
import { FundTransactionRepository } from "../fund/fundTransaction/fundTransaction.repository";
import { FUND_TRANSACTION_TYPES } from "../fund/fundTransaction/fundTransaction.types";
import { SERVICE_ORDER_TYPES } from "../serviceOrder/serviceOrder.types";
import { ClientServiceOrderRepository } from "../serviceOrder/client.serviceOrder.repository";

@injectable()
export class CommonRepository {
  constructor(
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(TRANSACTION_TYPES.TransactionRepository) private transactionRepository: TransactionRepository,
    @inject(MARGIN_TYPES.MarginRepository) private marginRepository: MarginRepository,
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
    @inject(FUND_TRANSACTION_TYPES.FundTransactionRepository)
    private fundTransactionRepository: FundTransactionRepository,
    @inject(SERVICE_ORDER_TYPES.ClientServiceOrderRepository)
    private serviceOrderRepository: ClientServiceOrderRepository,
  ) {}

  // Define your service methods here
  async getCode(type: CodeType, manager?: IEntityManager): Promise<string | null> {
    let code = null;
    switch (type) {
      case "User":
        code = await this.getCodeByUser(manager);
        break;
      case "Branch":
        code = await this.getCodeByBranch(manager);
        break;
      case "Customer":
        code = await this.getCodeByCustomer(manager);
        break;
      case "Employee":
        code = await this.getCodeByEmployee(manager);
        console.log("code employee", code);
        break;
      case "Finance":
        code = await this.getCodeByFinance(manager);
        break;
      case "Income":
        code = await this.getCodeByIncome(manager);
        break;
      case "Expense":
        code = await this.getCodeByExpense(manager);
        break;
      case "AdvanceSalary":
        code = await this.getCodeByAdvanceSalary(manager);
        break;
      case "AdvanceEmployee":
        code = await this.getCodeByAdvanceEmployee(manager);
        break;
      case "Transaction":
        code = await this.getCodeByTransaction(manager);
        break;
      case "Order":
        code = await this.getCodeByOrder(manager);
        break;
      case "ServiceOrder":
        code = await this.getCodeByServiceOrder(manager);
        break;
      case "Margin":
        code = await this.getCodeByMargin(manager);
        break;
      case "Debt":
        code = await this.getCodeByDebt(manager);
        break;
      case "FundTransaction":
        code = await this.getCodeByFundTransaction(manager);
        break;

      default:
        break;
    }

    return code;
  }

  //? Get code by user
  async getCodeByUser(manager?: IEntityManager): Promise<string | null> {
    const userCount = await this.userRepository.count(undefined, manager, true);
    //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
    const userCountString = userCount.toString();
    const digitCount = userCountString.length;
    const prefix = "0000";

    let i = 1;
    while (i < 10) {
      const checkExist = await this.userRepository.exists(
        {
          code: `ND${prefix.slice(digitCount)}${userCount + i}`,
        },
        manager,
      );
      if (!checkExist) {
        return `ND${prefix.slice(digitCount)}${userCount + i}`;
      }
      i++;
    }

    return null;
  }

  // //? Get code by branch
  async getCodeByBranch(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.branchRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.branchRepository.exists(
          {
            code: `CN${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `CN${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByBranch:", error);
      throw error;
    }
  }

  //? Get code by customer
  async getCodeByCustomer(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.customerRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.customerRepository.exists(
          {
            code: `KH${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `KH${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByCustomer:", error);
      throw error;
    }
  }

  //? Get code by employee
  async getCodeByEmployee(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.employeeRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.employeeRepository.exists(
          {
            code: `NV${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `NV${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByEmployee:", error);
      throw error;
    }
  }

  //? Get code by finance
  async getCodeByFinance(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.financeRepository.count(
        {
          code: Like("P-%"),
        },
        manager,
      );

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.financeRepository.exists(
          {
            code: `P${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `P${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByFinance:", error);
      throw error;
    }
  }

  //? get code by Finance Income
  async getCodeByIncome(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.financeRepository.countDistinct(
        "code",
        {
          code: Like("PT%"),
        },
        manager,
        true,
      );

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "000000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.financeRepository.exists(
          {
            code: `PT${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `PT${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByIncome:", error);
      throw error;
    }
  }

  //? get code by Finance Expense
  async getCodeByExpense(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.financeRepository.count(
        {
          code: Like("PC%"),
        },
        manager,
        true,
      );

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "000000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.financeRepository.exists(
          {
            code: `PC${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `PC${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByExpense:", error);
      throw error;
    }
  }

  //? get code by advance salary
  async getCodeByAdvanceSalary(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.financeRepository.count(
        {
          code: Like("TUL%"),
        },
        manager,
        true,
      );

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.financeRepository.exists(
          {
            code: `TUL${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `TUL${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByAdvanceSalary:", error);
      throw error;
    }
  }

  //? get code by advance employee
  async getCodeByAdvanceEmployee(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.financeRepository.count(
        {
          code: Like("TU%"),
        },
        manager,
        true,
      );

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.financeRepository.exists(
          {
            code: `TU${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `TU${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByAdvanceEmployee:", error);
      throw error;
    }
  }

  //? Get code by order
  async getCodeByOrder(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.orderRepository.count(undefined, manager, true);
      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "000000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.orderRepository.exists(
          {
            code: `HD${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `HD${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByOrder:", error);
      throw error;
    }
  }

  //? Get code by service order
  async getCodeByServiceOrder(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.serviceOrderRepository.count(undefined, manager, true);
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "000000";

      let i = 1;
      while (i < 10000) {
        const code = `DV${prefix.slice(digitCount)}${count + i}`;
        const checkExist = await this.serviceOrderRepository.exists({ code }, manager);

        if (!checkExist) {
          return code;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByServiceOrder:", error);
      throw error;
    }
  }

  // ? Get code by transaction
  async getCodeByTransaction(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.transactionRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.transactionRepository.exists(
          {
            code: `GD${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `GD${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByTransaction:", error);
      throw error;
    }
  }

  //? Get code by Margin
  async getCodeByMargin(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.marginRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.marginRepository.exists(
          {
            code: `KQ${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `KQ${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByMargin:", error);
      throw error;
    }
  }

  //? Get code by Debt
  async getCodeByDebt(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.debtRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.debtRepository.exists(
          {
            code: `NO${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `NO${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByDebt:", error);
      throw error;
    }
  }

  //? Get code by FundTransaction
  async getCodeByFundTransaction(manager?: IEntityManager): Promise<string | null> {
    try {
      const count = await this.fundTransactionRepository.count(undefined, manager, true);

      //? Lấy số chữ số của userCount , ví dụ 15 là 2 , 144 là 3
      const countString = count.toString();
      const digitCount = countString.length;
      const prefix = "0000";

      let i = 1;
      while (i < 10000) {
        const checkExist = await this.fundTransactionRepository.exists(
          {
            code: `FT${prefix.slice(digitCount)}${count + i}`,
          },
          manager,
        );

        if (!checkExist) {
          return `FT${prefix.slice(digitCount)}${count + i}`;
        }
        i++;
      }

      return null;
    } catch (error) {
      console.log("Error in getCodeByFundTransaction:", error);
      throw error;
    }
  }
}
