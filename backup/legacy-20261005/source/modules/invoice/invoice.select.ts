import { Invoice } from "@/database/models/Invoice";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { OrderSelectBasic } from "../order/order.select";
import { CustomerSelectLite } from "../customer/customer.select";
import { EmployeeSelectLite } from "../employee/employee.select";
import { BranchSelectBasic } from "../branch/branch.select";

export const InvoiceSelectBasic: FindOptionsSelect<Invoice> = {
  id: true,
  orderId: true,
  customerId: true,
  branchId: true,
  employeeId: true,
  timeAt: true,
  code: true,
  type: true,
  description: true,
  totalBeforeTax: true,
  taxPercent: true,
  taxAmount: true,
  totalAfterTax: true,
  note: true,
};

export const InvoiceSelectFull: FindOptionsSelect<Invoice> = {
  ...InvoiceSelectBasic,
  order: OrderSelectBasic,
  customer: CustomerSelectLite,
  employee: EmployeeSelectLite,
  branch: BranchSelectBasic,
};

export const InvoiceRelations: FindOptionsRelations<Invoice> = {
  order: true,
  customer: true,
  employee: true,
  branch: true,
};
