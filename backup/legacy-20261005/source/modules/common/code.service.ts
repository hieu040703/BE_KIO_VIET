import { CodeType } from "@/shared/constants/constance";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { inject, injectable } from "inversify";
import { COMMON_TYPES } from "./common.types";
import { CommonRepository } from "./common.repository";

@injectable()
export class CodeService {
  constructor(@inject(COMMON_TYPES.CommonRepository) private commonRepository: CommonRepository) {}

  async getCode(type: CodeType, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const code = await this.commonRepository.getCode(type, manager);
    return ApiResponseHandler.getSuccess("OK", { code });
  }
}
