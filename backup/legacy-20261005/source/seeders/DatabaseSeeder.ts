import { User } from "@/database/models/User";
import { Service } from "@/database/models/Service";
import { PositionDefaultEnum, ServiceOrderTypeEnum, UserRoleEnum } from "@/shared/constants/constance";
import { AuthUtils } from "@/shared/utils/auth.utils";
import { Attribute } from "../models/Attribute";
import DatabaseConfig from "@/database/database";
import { Employee } from "../models/Employee";
import { CreateEmployeeDto } from "@/modules/employee/employee.validator";
import { CreateUserDto } from "@/modules/user/user.validator";

export class DatabaseSeeder {
  static async run(): Promise<void> {
    console.log("🌱 Starting database seeding...");

    try {
      // Initialize database connection
      await DatabaseConfig.initialize();

      // Get repositories
      const userRepository = DatabaseConfig.getRepository(User);
      const categoryRepository = DatabaseConfig.getRepository(Attribute);
      const employeeRepository = DatabaseConfig.getRepository(Employee);
      const serviceRepository = DatabaseConfig.getRepository(Service);
      const branchRepository = DatabaseConfig.getRepository("Branch");
      const customerRepository = DatabaseConfig.getRepository("Customer");
      const fundRepository = DatabaseConfig.getRepository("Fund");

      const permissionGroupRepository = DatabaseConfig.getRepository("PermissionGroup");

      // Clear existing data (delete in correct order to avoid FK constraint issues)

      const existingUsers = await userRepository.find();
      if (existingUsers.length > 0) {
        await userRepository.remove(existingUsers);
      }
      console.log("✅ Cleared existing data");

      //? create employee for admin
      const adminEmployee = await employeeRepository.save({
        code: "NV-0001",
        name: "Admin Employee",
      });

      // Create users
      const hashedPassword = await AuthUtils.hashPassword("123456");

      const users = await userRepository.save([
        {
          username: "admin",
          code: "ADMIN",
          password: hashedPassword,
          name: "Admin",
          phone: "0123456789",
          role: UserRoleEnum.ADMIN,
          email: "admin@itomo.vn",
          employeeId: adminEmployee.id,
          avatar: "https://i.pravatar.cc/300?img=1",
          isActive: true,
        },
      ]);
      console.log("✅ Created users");

      const serviceSeedData = [
        {
          name: "Thuê bốc xếp theo ca",
          type: ServiceOrderTypeEnum.BOC_XEP_THEO_CA,
          autoQuote: true,
          servicePrices: [
            { name: "Ca 4 tiếng", quantity: 4, price: 400000, unit: "ca", excessUnitPrice: 100000 },
            { name: "Ca 6 tiếng", quantity: 6, price: 600000, unit: "ca", excessUnitPrice: 100000 },
          ],
        },
        {
          name: "Chuyển nhà + văn phòng trọn gói",
          type: ServiceOrderTypeEnum.CHUYEN_NHA_VAN_PHONG,
          autoQuote: false,
        },
        {
          name: "Phá dỡ hoàn trả mặt bằng",
          type: ServiceOrderTypeEnum.PHA_DO_HOAN_TRA,
          autoQuote: false,
        },
        {
          name: "Vận chuyển vật tư",
          type: ServiceOrderTypeEnum.VAN_CHUYEN_VAT_TU,
          autoQuote: false,
        },
        {
          name: "Nâng hạ cont hàng",
          type: ServiceOrderTypeEnum.NANG_HA_CONT,
          autoQuote: false,
        },
        {
          name: "Dịch vụ vận tải",
          type: ServiceOrderTypeEnum.DICH_VU_VAN_TAI,
          autoQuote: true,
          servicePrices: [
            { name: "Xe 2 tấn", quantity: 4, price: 400000, unit: "km", excessUnitPrice: 30000 },
            { name: "Xe 6 tấn", quantity: 4, price: 600000, unit: "km", excessUnitPrice: 30000 },
          ],
        },
        {
          name: "Xe nâng, xe cẩu",
          type: ServiceOrderTypeEnum.XE_NANG_XE_CAU,
          autoQuote: true,
          servicePrices: [
            { name: "Xe cẩu 2 tấn", quantity: 4, price: 400000, unit: "xe", excessUnitPrice: 30000 },
            { name: "Xe cẩu 6 tấn", quantity: 4, price: 600000, unit: "xe", excessUnitPrice: 30000 },
          ],
        },
      ];

      const existingServices = await serviceRepository.find();
      const existingServiceTypes = new Set(existingServices.map((service) => service.type));
      const missingServices = serviceSeedData
        .filter((service) => !existingServiceTypes.has(service.type))
        .map((service) => ({
          ...service,
          autoQuote: false,
          icon: null,
          description: null,
        }));

      if (missingServices.length > 0) {
        await serviceRepository.save(missingServices);
      }
      console.log("✅ Seeded services");

      //$ create permission groups
      const permissionGroup = await permissionGroupRepository.save([
        {
          name: "Quản lý",
          code: "MANAGER",
          permissions: {},
        },
        {
          name: "Kế toán",
          code: "ACCOUNTANT",
          permissions: {},
        },
      ]);
      console.log("✅ Created permission groups");

      //$ create branch
      const branch = await branchRepository.save([
        {
          code: "CN-0001",
          name: "Cơ sở 1",
          employeeId: adminEmployee.id,
          phone: "0866146497",
          address: {
            state: "Thành phố Hà Nội",
            ward: "Phường Cầu Giấy",
            detail: "P506, Tòa Nhà 714, Nguyễn Văn Cừ",
          },
        },
        {
          code: "CN-0002",
          name: "Cơ sở 2",
          employeeId: adminEmployee.id,
          phone: "0866146497",
          address: {
            state: "Thành phố Hà Nội",
            ward: "Phường Hai Bà Trưng",
            detail: "P0614 Time City",
          },
        },
        {
          code: "CN-0003",
          name: "Cơ sở 3",
          employeeId: adminEmployee.id,
          phone: "0866146497",
          address: {
            state: "Thành phố Hà Nội",
            ward: "Phường Hà Đông",
            detail: "P0126 R5",
          },
        },
        {
          code: "CN-0004",
          name: "Cơ sở 4",
          employeeId: adminEmployee.id,
          phone: "0866146497",
          address: {
            state: "Thành phố Hà Nội",
            ward: "Phường Bắc Từ Liêm",
            detail: "347 Cổ Nhuế",
          },
        },
      ]);

      //$ create employees
      const employeeData: CreateEmployeeDto[] = [
        {
          name: "Nguyễn Văn Nam",
          code: "NV-0002",
          branchId: branch[0].id,
          position: PositionDefaultEnum.SALE,
          department: "Kinh doanh",
          email: "nguyenvana@example.com",
        },
        {
          name: "Trần Thị Bình",
          code: "NV-0003",
          branchId: branch[0].id,
          position: PositionDefaultEnum.WAREHOUSE_MANAGER,
          department: "Kho",
          email: "tranthib@example.com",
        },
        {
          name: "Lê Văn Công",
          code: "NV-0004",
          branchId: branch[0].id,
          position: PositionDefaultEnum.ACCOUNTANT,
          department: "Kế toán",
          email: "levanc@example.com",
        },
        {
          name: "Phạm Thị Dung",
          code: "NV-0005",
          branchId: branch[0].id,
          position: PositionDefaultEnum.DRIVER,
          department: "Vận chuyển",
          email: "phamthid@example.com",
        },
      ];

      const employees = await employeeRepository.save(employeeData);

      const customers = await customerRepository.save([
        {
          name: "Công ty TNHH ABC",
          code: "KH-0001",
          phone: "0987654321",
          email: "contact@abc.com",
        },
        {
          name: "Công ty Cổ phần XYZ",
          code: "KH-0002",
          phone: "0912345678",
          email: "contact@xyz.com",
        },
        {
          name: "Anh Hoàn",
          code: "KH-0003",
          phone: "0912348888",
          email: "hoan@gmail.com",
        },
        {
          name: "Chị Nhung",
          code: "KH-0004",
          phone: "0912345333",
          email: "nhung@xyz.com",
        },
      ]);

      const fund = await fundRepository.save({
        name: "MBank",
        code: "QUY-0001",
        bankName: "Ngân hàng Quân Đội",
        bin: "970422",
        accountNumber: "0888382699",
        accountHolder: "PHAM VAN NAM",
        isDefault: true,
      });

      const dataCreateUser: CreateUserDto[] = employees.map((employee) => ({
        username: employee.code.toLowerCase(),
        code: employee.code,
        password: "123456",
        name: employee.name,
        role: UserRoleEnum.USER,
        employeeId: employee.id,
        permissionGroupId: permissionGroup[0].id,
        isActive: true,
      }));

      await userRepository.save(dataCreateUser);

      console.log("\n🔐 Default login credentials:");
      console.log("   📧 Username: admin");
      console.log("   🔑 Password: 123456");
    } catch (error) {
      console.error("❌ Database seeding failed:", error);
      throw error;
    } finally {
      // Close database connection
      await DatabaseConfig.destroy();
    }
  }
}
