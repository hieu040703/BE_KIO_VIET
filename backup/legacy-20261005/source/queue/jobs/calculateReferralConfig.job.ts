import { container } from "@/modules/container";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { AppSettingRepository } from "@/modules/appSetting/appSetting.repository";
import { APP_SETTING_TYPES } from "@/modules/appSetting/appSetting.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { CreateTimeKeepingDto } from "@/modules/timeKeeping/timeKeeping.validator";
import { OtherAmountTypeEnum, ReferralTypeEnum, TimeKeepingTypeEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";
import { IsNull, Not } from "typeorm";

/**
 * Tính thưởng giới thiệu nhân viên dựa trên cấu hình `salesTargetBonus` trong AppSetting.
 *
 * Trước đây: đọc danh sách từ bảng `referral_configs` (đã xoá).
 * Hiện tại: đọc từ `AppSetting.employee.salesTargetBonus[]` (mỗi entry đã có `appliedDate`
 * làm định danh ổn định, vì JSON array không có id). Mỗi TimeKeeping thưởng sẽ ghi
 * `referralEmployeeId` + `referralAppliedDate` để dedupe các lần chạy sau.
 */
async function process(): Promise<void> {
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
}

let job: Cron | null = null;

export const JobCalculateReferralConfig = {
  start: () => {
    if (!job) {
      job = new Cron(
        "0 0 * * * *", // chạy mỗi 1 h
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          logger.info("START JOB CALCULATE REFERRAL CONFIG: " + new Date().toISOString());
          await process();
        },
      );
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP JOB CALCULATE REFERRAL CONFIG");
    }
  },
};
