import { Employee } from "@/database/models/Employee";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const EmployeeSelectLite: FindOptionsSelect<Employee> = {
  id: true,
  code: true,
  name: true,
  email: true,
  phone: true,
  zaloName: true,
  avatar: true,
};

export const EmployeeSelectBasic: FindOptionsSelect<Employee> = {
  ...EmployeeSelectLite,
  branchId: true,
  managerId: true,
  recruiterId: true,
  recruiterReceivedFullBonus: true,
  dob: true,
  gender: true,
  address: true,
  identityNumber: true,
  status: true,
  isOfficial: true,
  isDefault: true,
  position: true,
  expertise: true,
  department: true,
  startDate: true,
  endDate: true,
  isWorking: true,
  note: true,
};

export const EmployeeSelectFull: FindOptionsSelect<Employee> = {
  ...EmployeeSelectBasic,
  // branch/manager/recruiter/user KHÔNG join ở đây để tránh TypeORM identity map bug:
  // - Branch có @ManyToOne(→Employee) với employeeId. Khi leftJoinAndSelect branch,
  //   TypeORM tạo stub Employee trong identity map. Row thực của nhân viên đó sẽ bị
  //   trả về stub (không update) → hiển thị dữ liệu sai.
  // - manager/recruiter: self-referential Employee→Employee
  // - user: @OneToOne(→Employee) back-reference
  // Tất cả được load riêng trong EmployeeRepository.findWithPagination.
};

export const EmployeeRelations: FindOptionsRelations<Employee> = {
  // Tất cả relation được load riêng bằng separate query trong EmployeeRepository
  // để tránh TypeORM identity map corruption.
};
