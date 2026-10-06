import { BaseRepository } from "@/shared/base/BaseRepository";
import { Token } from "@/database/models/Token";
import { EntityManager, FindOptionsSelect, In, IsNull, MoreThan, Not } from "typeorm";
import { TokenSelectFull, TokenRelations } from "./token.select";
import { AuthSessionTypeEnum } from "@/shared/constants/constance";

export class TokenRepository extends BaseRepository<Token> {
  protected entityClass = Token;
  protected selectedFields = TokenSelectFull;
  protected relations = TokenRelations;

  constructor() {
    super();
  }

  setOptions(selectedFields?: FindOptionsSelect<Token> | undefined): void {
    this.selectedFields = selectedFields || TokenSelectFull;
    this.relations = TokenRelations;
  }

  async findRefreshTokensByUserId(
    userId: string,
    manager?: EntityManager,
    sessionType?: AuthSessionTypeEnum,
  ): Promise<Token[]> {
    return await this.findByOptions(
      {
        where: {
          userId,
          refreshToken: Not(IsNull()),
          ...(sessionType ? { sessionType } : {}),
        },
        select: {
          id: true,
          userId: true,
          refreshToken: true,
          sessionType: true,
        },
      },
      manager,
    );
  }

  async deleteRefreshTokensByUserId(
    userId: string,
    manager?: EntityManager,
    sessionType?: AuthSessionTypeEnum,
  ): Promise<number> {
    return await this.deleteWithOption(
      {
        userId,
        refreshToken: Not(IsNull()),
        ...(sessionType ? { sessionType } : {}),
      },
      manager,
    );
  }

  async findFirebaseTokens(afterId?: string, limit = 500): Promise<Token[]> {
    return await this.findByOptions({
      where: {
        firebaseToken: Not(IsNull()),
        ...(afterId ? { id: MoreThan(afterId) } : {}),
      },
      select: {
        id: true,
        firebaseToken: true,
      },
      order: { id: "ASC" },
      take: limit,
    });
  }

  async clearFirebaseTokens(firebaseTokens: string[]): Promise<number> {
    if (firebaseTokens.length === 0) {
      return 0;
    }

    const result = await this.getRepository().update(
      {
        firebaseToken: In(firebaseTokens),
        deletedAt: IsNull(),
      },
      { firebaseToken: null },
    );

    return result.affected || 0;
  }
}
