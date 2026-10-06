import { inject, injectable } from "inversify";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { User } from "@/database/models/User";
import { UserSelectBasic } from "../user/user.select";
import { TOKEN_TYPES } from "../token/token.types";
import { TokenRepository } from "../token/token.repository";
import { AuthSessionTypeEnum } from "@/shared/constants/constance";
import { EntityManager } from "typeorm";
@injectable()
export class AuthRepository extends BaseRepository<User> {
  protected entityClass = User;
  constructor(@inject(TOKEN_TYPES.TokenRepository) private tokenRepository: TokenRepository) {
    super();
    this.setOptions(this.selectedFields, this.relations);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.getRepository().findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.getRepository().findOne({
      where: { username },
      select: {
        ...UserSelectBasic,
        password: true,
      },
      relations: {},
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.getRepository().findOne({
      where: [{ phone }, { username: phone }],
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    sessionType: AuthSessionTypeEnum = AuthSessionTypeEnum.MOBILE,
    manager?: EntityManager,
  ): Promise<void> {
    await this.tokenRepository.create({ userId, refreshToken, sessionType }, manager);
  }
}
