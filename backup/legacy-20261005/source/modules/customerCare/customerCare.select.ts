import { CustomerCare } from "@/database/models/CustomerCare";
import { CustomerSelectBasic } from "../customer/customer.select";
import { EmployeeSelectBasic } from "../employee/employee.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const CustomerCareSelectBasic: FindOptionsSelect<CustomerCare> = {
  id: true,
  customerId: true,
  employeeId: true,
  method: true,
  status: true,
  scheduledAt: true,
  completedAt: true,
  nextFollowUpAt: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

export const CustomerCareSelectFull: FindOptionsSelect<CustomerCare> = {
  ...CustomerCareSelectBasic,
  customer: CustomerSelectBasic,
  employee: EmployeeSelectBasic,
};

export const CustomerCareRelations: FindOptionsRelations<CustomerCare> = {
  customer: true,
  employee: true,
};
