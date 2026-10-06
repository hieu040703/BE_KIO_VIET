import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { ZaloMessageHistoryRepository } from "./zaloMessageHistory.repository";
import { ZALO_MESSAGE_HISTORY_TYPES } from "./zaloMessageHistory.types";
import { ZaloMessageHistory } from "@/database/models/ZaloMessageHistory";
import { ZaloMessageHistoryRelations, ZaloMessageHistorySelectFull } from "./zaloMessageHistory.select";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { Request } from "express";
import { ZaloService } from "../zalo.service";
import { ZALO_TYPES } from "../zalo.types";
import { SendMessageDto } from "../zalo.validator";
import { CUSTOMER_TYPES } from "@/modules/customer/customer.types";
import { CustomerRepository } from "@/modules/customer/customer.repository";
import { Utils } from "@/shared/utils/utils";

@injectable()
export class ZaloMessageHistoryService extends BaseService<ZaloMessageHistory> {
  protected findOptions = {};
  protected relations = ZaloMessageHistoryRelations;
  protected selectedFields = ZaloMessageHistorySelectFull;

  constructor(
    @inject(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryRepository)
    private zaloMessageHistoryRepository: ZaloMessageHistoryRepository,
    @inject(ZALO_TYPES.ZaloService)
    private zaloService: ZaloService,
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
  ) {
    super(zaloMessageHistoryRepository);
  }

  async resend(id: string, req?: Request, manager?: IEntityManager): Promise<ApiResponse<boolean>> {
    const history = await this.zaloMessageHistoryRepository.findById(id, manager);

    if (!history) {
      throw new NotFoundError("Lịch sử gửi Zalo không tồn tại");
    }

    if (!history.requestPayload) {
      throw new BadRequestError("Không tìm thấy payload đã lưu để gửi lại");
    }

    const payload = history.requestPayload as SendMessageDto;

    // lấy lại thông tin của khách hàng
    const customer = await this.customerRepository.findById(history.customerId);

    if (!customer) {
      throw new NotFoundError("Khách hàng không tồn tại trên hệ thống, vui lòng kiểm tra lại");
    }

    // cập nhật lại phone của khách hàng vào payload vì có thể đã thay đổi số khác
    if (customer.phone) {
      const customerPhone = Utils.normalizeStringeePhoneNumber(customer.phone);
      Object.assign(payload, { phone: customerPhone });
    }

    await this.zaloService.sendMessage(payload, {
      historyId: id,
      orderId: history.orderId,
      customerId: history.customerId,
    });

    return ApiResponseHandler.updateSuccess("OK", true);
  }
}
