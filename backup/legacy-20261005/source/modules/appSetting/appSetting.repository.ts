import { BaseRepository } from "@/shared/base/BaseRepository";
import { AppSetting } from "@/database/models/AppSetting";
import { FindOptionsSelect } from "typeorm";
import { AppSettingSelectFull, AppSettingRelations } from "./appSetting.select";
import { injectable } from "inversify";

@injectable()
export class AppSettingRepository extends BaseRepository<AppSetting> {
  protected entityClass = AppSetting;
  protected selectedFields = AppSettingSelectFull;
  protected relations = AppSettingRelations;

  constructor() {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<AppSetting> | undefined): void {
    this.selectedFields = selectedFields || AppSettingSelectFull;
    this.relations = AppSettingRelations;
  }

  /**
   * Lấy phần trăm VAT hiện tại từ cấu hình đơn hàng.
   * Trả về 0 nếu chưa có bản ghi cấu hình.
   */
  async getVatPercent(): Promise<number> {
    const settings = await this.findAll();
    if (settings.length === 0) {
      return 0;
    }
    return settings[0]?.order?.vat ?? 0;
  }

  async getCheckInDistanceThreshold(): Promise<number> {
    const settings = await this.findAll();
    if (settings.length === 0) {
      return 0;
    }
    return settings[0]?.order?.checkInDistanceThreshold ?? 0;
  }

  async getOrderStartNotificationMinutes(): Promise<number> {
    const settings = await this.findAll();
    if (settings.length === 0) {
      return 0;
    }
    return settings[0]?.order?.orderStartNotificationMinutes ?? 0;
  }

  async getUrgentOrderAlertIntervalMinutes(): Promise<number> {
    const settings = await this.findAll();
    return settings[0]?.order?.urgentOrderAlertIntervalMinutes ?? 0;
  }

  async getRegularOrderAlertIntervalMinutes(): Promise<number> {
    const settings = await this.findAll();
    return settings[0]?.order?.regularOrderAlertIntervalMinutes ?? 0;
  }

  async getOrderPricingConfig() {
    const order = (await this.findAll())[0]?.order;
    return {
      vat: order?.vat ?? 0,
      urgentOrderEnabled: order?.urgentOrderEnabled ?? false,
      urgentOrderHours: order?.urgentOrderHours ?? 0,
      urgentOrderSurchargePercent: order?.urgentOrderSurchargePercent ?? 0,
      fragileItemSurchargePercent: order?.fragileItemSurchargePercent ?? 0,
    };
  }

  async getCreatedByEmployeePercent(): Promise<number> {
    const settings = await this.findAll();
    return settings[0]?.order?.accountantRevenueShare ?? 0;
  }

  async getBranchManagerRevenueShare(): Promise<number> {
    const settings = await this.findAll();
    return settings[0]?.order?.branchManagerRevenueShare ?? 0;
  }

  /**
   * Lấy cấu hình thưởng/phạt nhân viên khi đạt/không đạt mục tiêu doanh số.
   */
  async getSalesTargetBonusList() {
    const settings = await this.findAll();
    return settings[0]?.employee?.salesTargetBonus ?? [];
  }
}
