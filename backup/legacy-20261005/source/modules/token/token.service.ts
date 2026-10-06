import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { TokenRepository } from "./token.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { Token } from "@/database/models/Token";
import { TokenRelations, TokenSelectBasic } from "./token.select";
import { COMMON_TYPES } from "../common/common.types";

@injectable()
export class TokenService extends BaseService<Token> {
  protected relations = TokenRelations;
  protected selectedFields = TokenSelectBasic;
  constructor(
    @inject(COMMON_TYPES.TokenRepository) private tokenRepository: TokenRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager
  ) {
    super(tokenRepository);
  }
}
