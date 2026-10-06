import { Order } from "@/database/models/Order";
import { BranchSelectBasic } from "../branch/branch.select";
import { EmployeeSelectLite } from "../employee/employee.select";
import { CustomerSelectBasic } from "../customer/customer.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { OrderEmployeeSelectFull } from "./orderEmployee/orderEmployee.select";
import { OrderDetailRelations, OrderDetailSelectBasic } from "./orderDetail/orderDetail.select";

export const OrderSelectBasic: FindOptionsSelect<Order> = {
  id: true,
  serviceOrderId: true,
  branchId: true,
  branchManagerId: true,
  branchManagerConfirmedStatus: true,
  branchManagerConfirmedAt: true,
  allocateRevenuePercent: true,
  hasAllocatedRevenue: true,
  name: true,
  code: true,
  customerId: true,
  customerEmail: true,
  customerPhone: true,
  customerTaxCode: true,
  timeAt: true,
  estimatedCompletionAt: true,
  address: true,
  deliveryAddress: true,
  preVatAmount: true,
  discountPercent: true,
  discountAmount: true,
  vat: true,
  vatAmount: true,
  amount: true,
  employeeCount: true,
  referrerId: true,
  referrerPercent: true,
  referrerAmount: true,
  isReferrerPaid: true,
  createdByEmployeeId: true,
  createdByEmployeePercent: true,
  isPaidForEmployeeCreateOrder: true,
  completedByEmployeeId: true,
  completedAt: true,
  description: true,
  status: true,
  link: true,
  isInvoiced: true,
  invoiceNumber: true,
  invoiceDate: true,
  deposit: true,
  isPaid: true,
  isUrgent: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

export const OrderSelectLite: FindOptionsSelect<Order> = {
  id: true,
  code: true,
  name: true,
};

export const OrderSelectFull: FindOptionsSelect<Order> = {
  ...OrderSelectBasic,
  details: OrderDetailSelectBasic,
  branch: BranchSelectBasic,
  customer: CustomerSelectBasic,
  branchManager: EmployeeSelectLite,
  referrer: EmployeeSelectLite,
  createdByEmployee: EmployeeSelectLite,
  completedByEmployee: EmployeeSelectLite,
  orderEmployees: OrderEmployeeSelectFull,
  orderLeaders: {
    id: true,
    orderId: true,
    employeeId: true,
    createdAt: true,
    updatedAt: true,
    employee: EmployeeSelectLite,
  },
  // orderComments: OrderCommentSelectFull,
};

export const OrderRelations: FindOptionsRelations<Order> = {
  branch: true,
  customer: true,
  referrer: true,
  branchManager: true,
  createdByEmployee: true,
  completedByEmployee: true,
  details: OrderDetailRelations,
  orderEmployees: true,
  orderLeaders: {
    employee: true,
  },
  // finances: true,
  // orderComments: true,
};
