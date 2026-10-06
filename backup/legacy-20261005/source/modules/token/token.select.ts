import { Token } from "@/database/models/Token";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const TokenSelectBasic: FindOptionsSelect<Token> = {
  id: true,
  userId: true,
  refreshToken: true,
  sessionType: true,
  firebaseToken: true,
  expiresAt: true,
};

export const TokenSelectFull: FindOptionsSelect<Token> = {
  ...TokenSelectBasic,
};

export const TokenRelations: FindOptionsRelations<Token> = {};
