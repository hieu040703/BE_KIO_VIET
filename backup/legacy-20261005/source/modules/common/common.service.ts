import fs from "fs";
import {
  CodeType,
  DebtTypeEnum,
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  OrderStatusEnum,
  OtherAmountTypeEnum,
  ReferralTypeEnum,
  TimeKeepingTypeEnum,
} from "@/shared/constants/constance";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { inject, injectable } from "inversify";
import { Between, EntityManager, FindOptionsWhere, ILike, In, IsNull, MoreThan, Not } from "typeorm";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";
import { ORDER_TYPES } from "../order/order.types";
import { OrderRepository } from "../order/order.repository";
import { FinanceRepository } from "../accountant/finance/finance.repository";
import { FINANCE_TYPES } from "../accountant/finance/finance.types";
import { DEBT_TYPES } from "../accountant/debt/debt.types";
import { DebtRepository } from "../accountant/debt/debt.repository";
import { GetDashboardStatsDto } from "./common.validator";
import { OrderCommentRepository } from "../order/orderComment/orderComment.repository";
import { ORDER_COMMENT_TYPES } from "../order/orderComment/orderComment.types";
import { Finance } from "@/database/models/Finance";
import { TIME_KEEPING_TYPES } from "../timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "../timeKeeping/timeKeeping.repository";
import { ADVANCE_SALARY_TYPES } from "../accountant/advanceSalary/advanceSalary.types";
import { AdvanceSalaryRepository } from "../accountant/advanceSalary/advanceSalary.repository";
import { TIME_KEEPING_CONFIRM_TYPES } from "../timeKeeping/timeKeepingConfirm/timeKeepingConfirm.types";
import { TimeKeepingConfirmRepository } from "../timeKeeping/timeKeepingConfirm/timeKeepingConfirm.repository";
import { COMMON_TYPES } from "./common.types";
import { CommonRepository } from "./common.repository";
import { CreateDebtDto } from "../accountant/debt/debt.validator";
import { OrderLeaderRepository } from "../order/orderLeader/orderLeader.repository";
import { ORDER_LEADER_TYPES } from "../order/orderLeader/orderLeader.types";
import { BranchRepository } from "../branch/branch.repository";
import { BRANCH_TYPES } from "../branch/branch.types";
import { OrderLeaderSelectBasic } from "../order/orderLeader/orderLeader.select";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import logger from "@/shared/utils/logger";
import { CreateTimeKeepingDto } from "../timeKeeping/timeKeeping.validator";
import { AppSettingRepository } from "../appSetting/appSetting.repository";
import { APP_SETTING_TYPES } from "../appSetting/appSetting.types";
import { container } from "../container";
import { validateUniquePhone, type PhoneOwner } from "./phone-uniqueness";
import { CallHistory } from "@/database/models/CallHistory";
import { CallNavigationRepository } from "../callNavigation/callNavigation.repository";
import { CALL_NAVIGATION_TYPES } from "../callNavigation/callNavigation.types";
import { CALL_HISTORY_TYPES } from "../callHistory/callHistory.types";
import { AdminCallHistoryRepository } from "../callHistory/admin.callHistory.repository";
import { Utils } from "@/shared/utils/utils";
import { ORDER_EMPLOYEE_TYPES } from "../order/orderEmployee/orderEmployee.types";
import { OrderEmployeeRepository } from "../order/orderEmployee/orderEmployee.repository";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

interface DashboardStats {
  // tổng doanh thu
  totalRevenue: number;
  // tổng chi phí
  totalExpense: number;
  // tổng hợp đồng
  totalOrders: number;
  // tổng khách hàng
  totalCustomers: number;
  // tổng nhân viên
  totalEmployees: number;

  // biểu đồ doanh thu theo tháng
  revenueByMonth: { month: string; revenue: number }[];

  // biểu đồ tỉ lệ % nguồn khách hàng theo kênh
  customerSourceRatio: { source: string; count: number }[];

  // danh sách 10 sự kiện gần đây
  recentEvents: { id: string; title: string; content: string; timeAt: Date; description: string }[];

  // top 10 khách hàng theo doanh thu
  topCustomers: { id: string; name: string; zaloName: string; code: string; revenue: number }[];

  // top 10 nhân viên theo lương
  topEmployees: { id: string; name: string; zaloName: string; code: string; salary: number }[];
}

@injectable()
export class CommonService {
  private uploadTempDir: string;

  constructor(
    @inject(ORDER_TYPES.OrderRepository) private orderRepository: OrderRepository,
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(ORDER_COMMENT_TYPES.OrderCommentRepository) private orderCommentRepository: OrderCommentRepository,
    @inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository,
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryRepository) private advanceSalaryRepository: AdvanceSalaryRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository) private timeKeepingRepository: TimeKeepingRepository,
    @inject(TIME_KEEPING_CONFIRM_TYPES.TimeKeepingConfirmRepository)
    private timeKeepingConfirmRepository: TimeKeepingConfirmRepository,
    @inject(COMMON_TYPES.CommonRepository) private commonRepository: CommonRepository,
    @inject(ORDER_LEADER_TYPES.OrderLeaderRepository) private orderLeaderRepository: OrderLeaderRepository,
    @inject(BRANCH_TYPES.BranchRepository) private branchRepository: BranchRepository,
    @inject(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository) private orderEmployeeRepository: OrderEmployeeRepository,
  ) {
    this.uploadTempDir = "uploads/temp";

    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(this.uploadTempDir)) {
      fs.mkdirSync(this.uploadTempDir, { recursive: true });
    }
  }

  // Define your service methods here
  async test(manager?: EntityManager): Promise<any> {
    console.log("Test common service");

    //! tìm tất cả các hợp đồng trong khoản thời gian có trạng thái đã hoàn thành => lấy danh sách orderLeader của hợp đồng đó
    //! tìm bên timeKeeping có employeeId = orderLeader.employeeId và otherAmountType = ALLOCATED_REVENUE_ORDER và referrerOrderId = order.id
    //! nếu có rồi thì check order.hasAllocatedRevenue = true, nếu chưa thì cập nhật lại order.hasAllocatedRevenue = true
    //! nếu chưa có thì tạo mới 1 bản ghi chấm công với employeeId = orderLeader.employeeId, otherAmountType = ALLOCATED_REVENUE_ORDER, referrerOrderId = order.id, otherAmount = orderLeader.revenueShare * (order.allocateRevenuePercent / 100), timeAt = order.timeAt, note = "Phân bổ doanh thu hợp đồng {Mã hợp đồng}"
    const function1 = async () => {
      const orders = await this.orderRepository.findByOptions({
        where: {
          timeAt: Between(new Date("2026-05-01"), new Date("2026-08-30")),
          status: OrderStatusEnum.COMPLETED,
        },
        select: {
          id: true,
          code: true,
          timeAt: true,
          allocateRevenuePercent: true,
          hasAllocatedRevenue: true,
          orderLeaders: OrderLeaderSelectBasic,
        },
        relations: {
          orderLeaders: true,
        },
      });

      console.log(`Tìm thấy ${orders.length} hợp đồng đã hoàn thành cần phân bổ doanh thu`);

      for (const order of orders) {
        const orderLeaders = order.orderLeaders ?? [];

        if (orderLeaders.length === 0) {
          console.log(`Bỏ qua hợp đồng ${order.code}: chưa có order leader`);
          continue;
        }

        for (const orderLeader of orderLeaders) {
          if (!orderLeader.employeeId || !orderLeader.revenueShare || !order.allocateRevenuePercent) continue;

          const expectedAmount = Math.round(orderLeader.revenueShare * (order.allocateRevenuePercent / 100));
          if (expectedAmount <= 0) continue;

          const existingTk = await this.timeKeepingRepository.findOne({
            employeeId: orderLeader.employeeId,
            otherAmountType: OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER,
            referrerOrderId: order.id,
          });

          if (existingTk) {
            if (!order.hasAllocatedRevenue) {
              await this.orderRepository.update(order.id, { hasAllocatedRevenue: true });
              console.log(`Cập nhật hasAllocatedRevenue = true cho hợp đồng ${order.code}`);
            }
          } else {
            await this.timeKeepingRepository.create({
              employeeId: orderLeader.employeeId,
              type: TimeKeepingTypeEnum.OUT,
              timeAt: order.timeAt,
              otherAmount: expectedAmount,
              otherAmountType: OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER,
              referrerOrderId: order.id,
              note: `Phân bổ doanh thu hợp đồng ${order.code}`,
            });
            console.log(
              `Tạo chấm công phân bổ doanh thu cho hợp đồng ${order.code} - nhân viên ${orderLeader.employeeId}`,
            );
          }
        }
      }
    };

    //! tìm tất cả các hợp đồng mà có nhân viên giới thiệu + hoa hồng cho nhân viên giới thiệu  + trang thái đã hoàn thành.
    //! tìm bên bảng chấm công có referrerOrderId = id đơn hàng đó,
    //! nếu không có thì tạo mới 1 bản ghi chấm công OUT với mức lương = % hoa hồng giới thiệu * amount, thời gian = thời gian của đơn hàng, note có nội dung "Hoa hồng giới thiệu khách hàng cho hợp đồng xxx"
    //! nếu có thì kiểm tra xem mức lương đã bằng % hoa hồng giới thiệu * amount chưa, nếu chưa thì cập nhật lại mức lương = % hoa hồng giới thiệu * amount, thời gian = thời gian của đơn hàng, note có nội dung "Cập nhật hoa hồng giới thiệu khách hàng cho hợp đồng xxx"
    const function10 = async () => {
      const orders = await this.orderRepository.findByOptions({
        where: {
          timeAt: Between(new Date("2026-05-01"), new Date("2026-08-30")),
          status: OrderStatusEnum.COMPLETED,
          referrerId: Not(IsNull()),
          referrerPercent: Not(IsNull()),
        },
      });

      console.log(`Tìm thấy ${orders.length} hợp đồng có nhân viên giới thiệu đã hoàn thành`);

      for (const order of orders) {
        if (order.isReferrerPaid || !order.referrerId || !order.referrerPercent) continue;

        const expectedAmount = Math.round((order.referrerPercent * order.amount) / 100);
        if (!expectedAmount || expectedAmount <= 0) continue;

        const existingTk = await this.timeKeepingRepository.findOne({
          referrerOrderId: order.id,
          otherAmountType: OtherAmountTypeEnum.REFERRER_ORDER,
        });

        const employee = await this.employeeRepository.findById(order.referrerId);
        if (!employee) {
          console.log(
            `Không tìm thấy nhân viên với ID ${order.referrerId} - bỏ qua tạo chấm công hoa hồng cho hợp đồng ${order.code}`,
          );
          continue;
        }

        if (!existingTk) {
          await this.timeKeepingRepository.create({
            employeeId: order.referrerId,
            type: TimeKeepingTypeEnum.OUT,
            timeAt: order.timeAt,
            otherAmount: expectedAmount,
            otherAmountType: OtherAmountTypeEnum.REFERRER_ORDER,
            referrerOrderId: order.id,
            note: `HH mã HĐ ${order.code}`,
          });
          console.log(`Tạo mới chấm công hoa hồng cho hợp đồng ${order.code}`);
        } else if (!existingTk.isPaid && existingTk.otherAmount !== expectedAmount) {
          console.log(
            `Cập nhật chấm công hoa hồng cho hợp đồng ${order.code}: ${existingTk.otherAmount} -> ${expectedAmount}`,
          );
          await this.timeKeepingRepository.update(existingTk.id, {
            otherAmount: expectedAmount,
            timeAt: order.timeAt,
            note: `Cập nhật HH mã HĐ ${order.code} của nhân viên ${employee.name}`,
          });
        } else {
          console.log(`Bỏ qua hợp đồng ${order.code}: hoa hồng đã đúng`);
        }
      }
    };

    //! lấy tất cả hợp đồng trong tháng 5, kiểm tra xem có hợp đồng nào đã hoàn thành và order leader chưa có phân bổ cho quản lý của chi nhánh đó chưa
    //! nếu chưa có thì tạo mới order leader với revenueShare = amount của đơn hàng đó cho quản lý chi nhánh
    //! nếu đã có thì kiểm tra xem revenueShare = amount chưa, nếu chưa thì cập nhật lại revenueShare = amount, nếu đã đúng rồi thì thôi
    const function11 = async () => {
      const orders = await this.orderRepository.findByOptions({
        where: {
          timeAt: Between(new Date("2026-06-01"), new Date("2026-06-30")),
          status: OrderStatusEnum.COMPLETED,
        },
        select: {
          orderLeaders: OrderLeaderSelectBasic,
        },
        relations: {
          orderLeaders: true,
        },
      });

      for (const order of orders) {
        const branch = await this.branchRepository.findById(order.branchId, manager);

        if (!branch?.employeeId) {
          console.log(`Bỏ qua hợp đồng ${order.code}: chi nhánh chưa có nhân viên phụ trách`);
          continue;
        }

        const hasManagerLeader = order.orderLeaders?.some((leader) => leader.employeeId === branch.employeeId);

        if (!hasManagerLeader) {
          console.log(`Tạo order leader cho quản lý chi nhánh của hợp đồng ${order.code}`);
          await this.orderLeaderRepository.create(
            {
              orderId: order.id,
              employeeId: branch.employeeId,
              revenueShare: order.amount,
            },
            manager,
          );
        } else {
          const managerLeader = order.orderLeaders?.find((leader) => leader.employeeId === branch.employeeId);
          if (managerLeader && managerLeader.revenueShare !== order.amount) {
            console.log(
              `Cập nhật order leader cho quản lý chi nhánh của hợp đồng ${order.code}: ${managerLeader.revenueShare} -> ${order.amount}`,
            );
            await this.orderLeaderRepository.update(managerLeader.id, { revenueShare: order.amount }, manager);
          } else {
            console.log(
              `Bỏ qua hợp đồng ${order.code}: đã có order leader cho quản lý chi nhánh và revenueShare đã đúng`,
            );
          }
        }
      }
    };

    //! tìm tất cả các chấm lương trong khoảng thời gian + note có nội dung "Phân bổ doanh thu từ ngày ... đến ngày ... cho nhân viên"
    //! lặp qua từng bản ghi chấm công, xóa bản ghi chấm này.
    //! lấy ra khoản thời gian startAt và endAt từ note, vào bảng OrderLeader tìm những đơn hàng nào có timeAt trong khoảng thời gian đó và có employeeId trùng với employeeId của chấm công => cập nhật lại isRevenueShareAllocated =false
    const function12 = async () => {
      const timeKeepings = await this.timeKeepingRepository.findByOptions(
        {
          where: {
            timeAt: Between(
              dayjs.tz("2026-05-01", "Asia/Ho_Chi_Minh").startOf("day").toDate(),
              dayjs.tz("2026-06-30", "Asia/Ho_Chi_Minh").endOf("day").toDate(),
            ),
            note: ILike("Phân bổ doanh thu từ ngày%"),
          },
        },
        manager,
        true,
      );

      console.log("timeKeepings", timeKeepings.length);

      for (const tk of timeKeepings) {
        console.log(`Xóa chấm công phân bổ doanh thu của nhân viên ${tk.employeeId}`);

        // await this.timeKeepingRepository.delete(tk.id);

        const regex = /Phân bổ doanh thu từ ngày (.+) đến(?: ngày)? (.+) cho nhân viên/;
        const match = tk.note?.match(regex);
        console.log("match", match);
        if (match) {
          const startAt = dayjs.tz(match[1], "DD-MM-YYYY", "Asia/Ho_Chi_Minh").startOf("day").toDate();
          const endAt = dayjs.tz(match[2], "DD-MM-YYYY", "Asia/Ho_Chi_Minh").endOf("day").toDate();

          // Lấy danh sách orderId thỏa điều kiện trước, sau đó mới query OrderLeader
          const orders = await this.orderRepository.findByOptions({
            where: {
              timeAt: Between(startAt, endAt),
              status: OrderStatusEnum.COMPLETED,
            },
            select: { id: true },
          });
          const orderIds = orders.map((o) => o.id);

          if (orderIds.length === 0) {
            console.log(`Không có hợp đồng nào trong khoảng thời gian cho nhân viên ${tk.employeeId}`);
            continue;
          }

          const orderLeaders = await this.orderLeaderRepository.findByOptions({
            where: {
              employeeId: tk.employeeId,
              orderId: In(orderIds),
            },
            relations: { order: true },
          });

          console.log("Số đơn của nhân viên ", tk.employeeId, " trong khoảng thời gian: ", orderLeaders.length);

          for (const orderLeader of orderLeaders) {
            // console.log(`Cập nhật isRevenueShareAllocated = false cho order leader ${orderLeader.id}}`);
            // await this.orderLeaderRepository.update(orderLeader.id, { isRevenueShareAllocated: false }, manager);
          }
        }
      }
    };

    // đồng bộ lại thưởng khi giới thiệu nhân viên
    const function13 = async () => {
      try {
        const employeeRepository = container.get<EmployeeRepository>(EMPLOYEE_TYPES.EmployeeRepository);
        const appSettingRepository = container.get<AppSettingRepository>(APP_SETTING_TYPES.AppSettingRepository);
        const timekeepingRepository = container.get<TimeKeepingRepository>(TIME_KEEPING_TYPES.TimeKeepingRepository);

        // Lấy cấu hình salesTargetBonus (chỉ loại BONUS), sắp xếp theo daysWorking tăng dần
        const settings = await appSettingRepository.findAll();
        const allBonusConfigs = settings[0]?.employee?.salesTargetBonus ?? [];
        const bonusConfigs = allBonusConfigs
          .filter((c) => c.type === ReferralTypeEnum.BONUS)
          .map((c) => ({ ...c, appliedDate: new Date(c.appliedDate) }))
          .sort((a, b) => a.daysWorking - b.daysWorking);

        if (bonusConfigs.length === 0) {
          return;
        }

        console.log("Bonus configs:", bonusConfigs);

        // Lấy danh sách distinct recruiterId (nhân viên đã giới thiệu người khác)
        const recruiters = await employeeRepository
          .getRepository()
          .createQueryBuilder("employee")
          .select("DISTINCT employee.recruiterId", "recruiterId")
          .where("employee.recruiterId IS NOT NULL")
          .getRawMany<{ recruiterId: string }>();

        console.log("Recruiters:", recruiters);

        // lấy hết các bản ghi thưởng giới thiệu nhân viên
        const allExistingBonuses = await timekeepingRepository.findByOptions({
          where: {
            referralEmployeeId: Not(IsNull()),
            employeeId: Not(IsNull()),
          },
        });

        //? lặp qua từng người giới thiệu
        for (const { recruiterId } of recruiters) {
          if (!recruiterId) continue;

          //# Lấy tất cả nhân viên đã được recruiter này giới thiệu - trừ những nhân viên đã nhận đủ thưởng (recruiterReceivedFullBonus = true)
          const referredEmployees = await employeeRepository.findByOptions({
            where: { recruiterId, recruiterReceivedFullBonus: false },
          });

          //? lặp qua từng nhân viên được giới thiệu
          for (const referredEmp of referredEmployees) {
            // Lấy các bản ghi thưởng đã tạo cho cặp (recruiter, referred_emp)
            const existingBonuses = allExistingBonuses.filter(
              (b) => b.employeeId === recruiterId && b.referralEmployeeId === referredEmp.id,
            );

            // Đã có bonus cho tất cả cấu hình → bỏ qua
            if (existingBonuses.length >= bonusConfigs.length) {
              //$ cập nhật recruiterReceivedFullBonus = true cho nhân viên được giới thiệu
              await employeeRepository.update(referredEmp.id, { recruiterReceivedFullBonus: true });
              continue;
            }

            //$ Tính tổng số ngày công của nhân viên được giới thiệu
            const totalDays = await timekeepingRepository.calculateTotalWorkingDaysOfEmployee(referredEmp.id);
            // logger.info(`Total working days for referred employee ${referredEmp.id}: ${totalDays}`);

            //? Lấy code của các bonus đã tạo so sánh với bonusConfigs để biết cấu hình nào còn thiếu
            const pendingConfigs = bonusConfigs.filter(
              (c) => !existingBonuses.some((b) => b.referralConfigCode === c.code),
            );

            for (const config of pendingConfigs) {
              if (totalDays >= config.daysWorking) {
                const newBonus: CreateTimeKeepingDto = {
                  type: TimeKeepingTypeEnum.OUT,
                  timeAt: new Date(),
                  startTime: new Date().toTimeString().split(" ")[0],
                  endTime: new Date().toTimeString().split(" ")[0],
                  totalHours: 0,
                  salary: 0,
                  otherAmount: config.bonusValue,
                  otherAmountType: OtherAmountTypeEnum.BONUS,
                  employeeId: recruiterId,
                  referralEmployeeId: referredEmp.id,
                  referralAppliedDate: new Date(config.appliedDate),
                  referralConfigCode: config.code,
                  note: `Thưởng giới thiệu nhân viên ${referredEmp.name} đủ ${config.daysWorking} ngày làm việc`,
                };
                await timekeepingRepository.create(newBonus);
                logger.info(`Tạo thưởng ${config.code} cho nhân viên ${recruiterId} giới thiệu  ${referredEmp.id}`);
              } else {
                // Danh sách đã sort theo daysWorking ASC, cấu hình đầu tiên chưa đạt → các cấu hình sau cũng không đạt
                break;
              }
            }
          }
        }
      } catch (error) {
        logger.error("Error in JobCalculateReferralConfig: ", error);
      }
    };

    //! Lặp qua hết tất cả các bản ghi lịch sử cuộc gọi CallHistory ch
    //! Tại mỗi bản ghi lấy ch :
    //! ==>  lấy ch.callId -> tìm trong bảng CallNavigation cn -> ch.callId = cn.callId -> lấy cn.orderId -> cập nhật vào ch.orderId
    //! ==>  lấy ch.callerPhoneNumber và ch.receiverPhoneNumber -> nếu là số điện thoại -> vào bảng nhân viên Employee e xem só điện thoại có thuộc của nhân viên nào -> cập nhật ch.callerId hoặc ch.receiverId tương ứng
    //! ==>  lấy ch.callerPhoneNumber và ch.receiverPhoneNumber -> nếu là uuid (chính là userId của nhân viên tương ứng) -> cập nhật ch.callerId hoặc ch.receiverId tương ứng.
    const function14 = async () => {
      const callHistoryRepository = container.get<AdminCallHistoryRepository>(
        CALL_HISTORY_TYPES.AdminCallHistoryRepository,
      );
      const callNavigationRepository = container.get<CallNavigationRepository>(
        CALL_NAVIGATION_TYPES.CallNavigationRepository,
      );

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isPhone = (value?: string | null): boolean => Boolean(value && /^\+?\d{8,15}$/.test(value));

      // Map callerPhoneNumber/receiverPhoneNumber => userId (callerId/receiverId)
      const resolveUserId = async (value?: string | null): Promise<string | null> => {
        if (!value) return null;

        // nếu là uuid thì chính là userId của nhân viên tương ứng
        if (UUID_REGEX.test(value)) {
          return value;
        }

        // nếu là số điện thoại thì tìm nhân viên có số điện thoại trùng khớp
        if (isPhone(value)) {
          const employee = await this.employeeRepository.findEmployeeByPhone(Utils.normalizePhoneNumber(value));
          return employee?.user?.id ?? null;
        }

        return null;
      };

      // Lặp qua toàn bộ lịch sử cuộc gọi
      const callHistories = await callHistoryRepository.findByOptions({
        select: {
          id: true,
          callId: true,
          callerPhoneNumber: true,
          receiverPhoneNumber: true,
          callerId: true,
          receiverId: true,
          orderId: true,
        },
      });

      console.log(`Tìm thấy ${callHistories.length} bản ghi lịch sử cuộc gọi cần đồng bộ`);

      for (const ch of callHistories) {
        const updates: Partial<CallHistory> = {};

        //# 1. map callId -> CallNavigation -> orderId
        if (ch.callId && !ch.orderId) {
          const navigation = await callNavigationRepository.findOne({ callId: ch.callId });
          if (navigation?.orderId) {
            updates.orderId = navigation.orderId;
          }
        }

        //# 2 & 3. map callerPhoneNumber / receiverPhoneNumber -> callerId / receiverId
        if (!ch.callerId) {
          const callerId = await resolveUserId(ch.callerPhoneNumber);
          if (callerId) updates.callerId = callerId;
        }

        if (!ch.receiverId) {
          const receiverId = await resolveUserId(ch.receiverPhoneNumber);
          if (receiverId) updates.receiverId = receiverId;
        }

        if (Object.keys(updates).length === 0) {
          continue;
        }

        await callHistoryRepository.update(ch.id, updates);
      }
    };

    //! lặp qua các bản ghi OrderEmployee từ ngày 16/9 trở đi, xem có bản ghi nào có checkInAt và checkOutAt nhưng totalHours = null => cập nhật totalHours
    const function15 = async () => {
      const daycheck = dayjs("2026/09/16").startOf("days").toDate();
      console.log(daycheck);
      const oes = await this.orderEmployeeRepository.findByOptions({
        where: {
          checkInAt: MoreThan(daycheck),
          checkOutAt: MoreThan(daycheck),
          totalHours: IsNull(),
        },
      });

      // tim trong bang TimeKeeping xem thieu bao nhieu ban ghi
      const tks = await this.timeKeepingRepository.findByOptions({
        where: {
          timeAt: MoreThan(daycheck),
          salary: MoreThan(0),
          startTime: Not(IsNull()),
          endTime: Not(IsNull()),
          totalHours: IsNull(),
        },
      });

      console.log(tks[0]);
      console.log("Total have oes:", oes.length);
      console.log("Total have tks:", tks.length);

      // update totalHours
      // for (const oe of oes) {
      //   const th = dayjs(oe.checkOutAt).diff(oe.checkInAt, "hours", true) - (oe.breakTime || 0);
      //   console.log("th:", Number(th.toFixed(2)));
      //   await this.orderEmployeeRepository.update(oe.id, {
      //     totalHours: Number(th.toFixed(2)),
      //   });
      // }

      const oesOftks = await this.orderEmployeeRepository.findByOptions({
        where: {
          id: In(tks.map((tk) => tk.orderEmployeeId)),
        },
      });
      for (const tk of tks) {
        console.log("tk", tk);
        const oe = oesOftks.find((oet) => oet.id === tk.orderEmployeeId);
        if (oe) {
          console.log("oe", oe);
          await this.timeKeepingRepository.update(tk.id, {
            totalHours: oe.totalHours,
          });
        }
      }
    };

    // await function10();
    // await function11();
    // await function12();
    // await function13();
    // await function14();
    await function15();

    return { message: "Test completed" };
  }

  //? get hotline phone for driver
  async getHotline(manager?: EntityManager): Promise<ApiResponse<any>> {
    const hotline = "02873002468";
    return ApiResponseHandler.getSuccess("OK", { hotline });
  }

  async validateUniquePhone(
    phone: string | null | undefined,
    owner: PhoneOwner,
    ownerId?: string,
    manager?: IEntityManager,
  ): Promise<void> {
    return validateUniquePhone(phone, owner, ownerId, manager, this.employeeRepository, this.customerRepository);
  }

  async getDashboardStats(data: GetDashboardStatsDto, manager?: EntityManager): Promise<ApiResponse<any>> {
    let stats: DashboardStats = {
      totalRevenue: 0,
      totalExpense: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalEmployees: 0,
      revenueByMonth: [],
      recentEvents: [],
      topCustomers: [],
      topEmployees: [],
      customerSourceRatio: [],
    };

    let options: FindOptionsWhere<Finance> = {
      timeAt: Between(data.startAt, data.endAt),
    };

    if (data.branchId) {
      options.branchId = data.branchId;
    }

    const revenueOptions = { ...options, status: OrderStatusEnum.COMPLETED };
    const expenseOptions = {
      ...options,
      type: In([FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY]),
      status: ExpenseApprovalStatusEnum.APPROVED,
    };

    const totalRevenue = await this.orderRepository.sum("amount", revenueOptions, manager);
    const totalExpense = await this.financeRepository.sum("amount", expenseOptions, manager);

    stats.totalRevenue = Number(totalRevenue);
    stats.totalExpense = Number(totalExpense);

    stats.totalOrders = await this.orderRepository.count(
      { timeAt: Between(data.startAt, data.endAt), status: Not(OrderStatusEnum.CANCELED) },
      manager,
    );
    stats.totalCustomers = await this.customerRepository.count({}, manager);
    stats.totalEmployees = (await this.employeeRepository.count({}, manager)) - 1; // trừ 1 vì nhân viên admin ko tính

    // Lấy doanh thu theo từng tháng trong 12 tháng gần nhất
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const month12Ago = now.subtract(11, "month");

    for (let i = 0; i < 12; i++) {
      const monthStart = month12Ago.add(i, "month").startOf("month").toDate();
      const monthEnd = month12Ago.add(i, "month").endOf("month").toDate();
      stats.revenueByMonth.push({
        month: month12Ago.add(i, "month").format("MM-YYYY"),
        revenue: await this.orderRepository.sum(
          "amount",
          { ...revenueOptions, timeAt: Between(monthStart, monthEnd) },
          manager,
        ),
      });
    }

    // Lấy 5 sự kiện gần đây
    const topCommentRaws = await this.orderCommentRepository.getRecentComments(5);
    stats.recentEvents = topCommentRaws.map((comment) => {
      return {
        id: comment.id,
        title: comment.order ? String(comment.order.name) : "Hệ thống",
        content: String(comment.content) || "",
        timeAt: comment.timeAt,
        description: comment.attachments && comment.attachments.length > 0 ? "Có file đính kèm" : "",
      };
    });

    // Lấy top 10 khách hàng theo doanh thu
    const topCustomersRaw = await this.customerRepository.getCustomerByRevenue(data.startAt, data.endAt);
    stats.topCustomers = topCustomersRaw.map((customer) => {
      return {
        id: customer.id,
        name: String(customer.name),
        zaloName: customer.zaloName ? String(customer.zaloName) : "",
        code: String(customer.code) || "",
        revenue: (customer as any).totalRevenue,
      };
    });

    // Lấy top 10 nhân viên theo lương
    const topEmployeesRaw = await this.employeeRepository.getEmployeeBySalary(data.startAt, data.endAt);
    stats.topEmployees = topEmployeesRaw.map((employee) => {
      return {
        id: employee.id,
        name: String(employee.name),
        zaloName: employee.zaloName ? String(employee.zaloName) : "",
        code: String(employee.code) || "",
        salary: (employee as any).totalSalary,
      };
    });

    // Lấy tỉ lệ % nguồn khách hàng theo kênh
    const customerSourceRaws = await this.customerRepository.getCustomerSourceRatio();
    stats.customerSourceRatio = customerSourceRaws.map((source) => {
      return {
        source: source.source ? source.source : "OTHER",
        count: source.count,
      };
    });

    return ApiResponseHandler.getSuccess("OK", stats);
  }

  async getCode(type: CodeType, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const code = await this.commonRepository.getCode(type, manager);
    return ApiResponseHandler.getSuccess("OK", { code });
  }
}
