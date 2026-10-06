import { injectable, inject } from "inversify";
import { TokenService } from "./token.service";
import { BaseController } from "@/shared/base/BaseController";
import { TOKEN_TYPES } from "./token.types";

@injectable()
export class TokenController extends BaseController<TokenService> {
  constructor(@inject(TOKEN_TYPES.TokenService) protected service: TokenService) {
    super(service);
  }
}
