import { container } from "@/modules/container";
import { EmployeeRepository } from "@/modules/employee/employee.repository";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { OrderStatusEnum, OtherAmountTypeEnum, TimeKeepingTypeEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";
import { Between, IsNull, Not } from "typeorm";
import { ORDER_TYPES } from "@/modules/order/order.types";
import { OrderRepository } from "@/modules/order/order.repository";
import dayjs from "dayjs";

async function process(): Promise<void> {
  const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
  const employeeRepository = container.get<EmployeeRepository>(EMPLOYEE_TYPES.EmployeeRepository);
  const timeKeepingRepository = container.get<TimeKeepingRepository>(TIME_KEEPING_TYPES.TimeKeepingRepository);

  const orders = await orderRepository.findByOptions({
    where: {
      timeAt: Between(dayjs().subtract(1, "month").startOf("months").toDate(), dayjs().endOf("months").toDate()),
      status: OrderStatusEnum.COMPLETED,
      referrerId: Not(IsNull()),
      referrerPercent: Not(IsNull()),
    },
  });

  for (const order of orders) {
    if (order.isReferrerPaid || !order.referrerId || !order.referrerPercent) continue;

    const expectedAmount = Math.round((order.referrerPercent * order.amount) / 100);
    if (!expectedAmount || expectedAmount <= 0) continue;

    const existingTk = await timeKeepingRepository.findOne({
      referrerOrderId: order.id,
      otherAmountType: OtherAmountTypeEnum.REFERRER_ORDER,
    });

    const employee = await employeeRepository.findById(order.referrerId);
    if (!employee) {
      logger.warn(
        `Không tìm thấy nhân viên với ID ${order.referrerId} - bỏ qua tạo chấm công hoa hồng cho hợp đồng ${order.code}`,
      );
      continue;
    }

    if (!existingTk) {
      await timeKeepingRepository.create({
        employeeId: order.referrerId,
        type: TimeKeepingTypeEnum.OUT,
        timeAt: order.timeAt,
        otherAmount: expectedAmount,
        otherAmountType: OtherAmountTypeEnum.REFERRER_ORDER,
        referrerOrderId: order.id,
        note: `HH mã HĐ ${order.code}`,
      });
      logger.info(`Tạo mới chấm công hoa hồng cho hợp đồng ${order.code}`);
    } else if (!existingTk.isPaid && existingTk.otherAmount !== expectedAmount) {
      logger.info(
        `Cập nhật chấm công hoa hồng cho hợp đồng ${order.code}: ${existingTk.otherAmount} -> ${expectedAmount}`,
      );
      await timeKeepingRepository.update(existingTk.id, {
        otherAmount: expectedAmount,
        timeAt: order.timeAt,
        note: `Cập nhật HH mã HĐ ${order.code} của nhân viên ${employee.name}`,
      });
    } else {
      logger.info(`Bỏ qua hợp đồng ${order.code}: hoa hồng đã đúng`);
    }
  }
}

let job: Cron | null = null;

export const JobCalculateReferralOrder = {
  start: () => {
    if (!job) {
      job = new Cron(
        "0 0 * * * *", // chạy mỗi 1 giờ
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          logger.info("START JOB CALCULATE REFERRAL ORDER: " + new Date().toISOString());
          await process();
        },
      );
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP JOB CALCULATE REFERRAL ORDER");
    }
  },
};
