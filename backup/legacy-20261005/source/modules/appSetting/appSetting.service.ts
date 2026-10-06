import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { AppSettingRepository } from "./appSetting.repository";
import { APP_SETTING_TYPES } from "./appSetting.types";
import { AppSetting } from "@/database/models/AppSetting";
import { AppSettingRelations, AppSettingSelectFull } from "./appSetting.select";
import { ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";

@injectable()
export class AppSettingService extends BaseService<AppSetting> {
  protected relations = AppSettingRelations;
  protected selectedFields = AppSettingSelectFull;

  constructor(
    @inject(APP_SETTING_TYPES.AppSettingRepository) private appSettingRepository: AppSettingRepository,
  ) {
    super(appSettingRepository);
  }

  /**
   * Lấy phần trăm VAT hiện tại từ cấu hình đơn hàng.
   * Trả về 0 nếu chưa có cấu hình đơn hàng.
   */
  async getVatAppSetting(): Promise<ApiResponse<number>> {
    const settings = await this.appSettingRepository.findAll();
    const vat = settings[0]?.order?.vat ?? 0;
    return ApiResponseHandler.getSuccess("OK", vat);
  }
}
