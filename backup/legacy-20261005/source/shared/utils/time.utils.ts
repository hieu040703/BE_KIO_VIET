import dayjs from "dayjs";

export class TimeUtils {
  private static readonly startSimulatedTime = dayjs(process.env.TIME_CONVERSION_START_DATE || Date.now()); // thời gian giả lập bắt đầu
  private static readonly rate = parseFloat(process.env.TIME_CONVERSION_RATE || "1"); // tỉ lệ thời gian chạy so với thực tế, mặc định là 30

  static getTime(time?: Date | string | number | null): dayjs.Dayjs {
    if (TimeUtils.rate === 1) {
      return dayjs(time);
    }
    const nowReal = Date.now();
    const elapsedRealSeconds = (nowReal - TimeUtils.startSimulatedTime.toDate().getTime()) / 1000;
    return TimeUtils.startSimulatedTime.add(elapsedRealSeconds * TimeUtils.rate, "second");
  }

  static getStartOfDay(date: Date): Date {
    return dayjs(date).startOf("day").toDate();
  }
  static getEndOfDay(date: Date): Date {
    return dayjs(date).endOf("day").toDate();
  }
  static getStartOfNextDay(date: Date): Date {
    const startOfDay = dayjs(date).startOf("day").add(1, "day").toDate();
    return startOfDay;
  }

  /**
   * Mô phỏng thời gian chạy theo tỉ lệ với thực tế, mục đích để test các chức năng liên quan đến thời gian
   * @param startDate Ngày bắt đầu mô phỏng
   * @param rate tỉ lệ thời gian chạy so với thực tế, ví dụ : 1000 => 1 giây thực tế = 1000 giây mô phỏng
   * @returns thời gian đã mô phỏng (Date)
   */
  static simulateTime(startDate: Date, rate: number): Date {
    const realSeconds = dayjs().diff(dayjs(TimeUtils.startSimulatedTime), "seconds");
    return dayjs()
      .add(realSeconds * rate, "seconds")
      .toDate();
  }
}
