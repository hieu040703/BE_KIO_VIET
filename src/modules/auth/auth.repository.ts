import { injectable } from "inversify";
import DatabaseConfig from "@/database/database";
import { RetailUser } from "@/database/models";

@injectable()
export class AuthRepository {
  async findByCredentials(email: string, tenantId?: string): Promise<RetailUser | null> {
    const query = DatabaseConfig.getRepository(RetailUser)
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .andWhere("user.status = :status", { status: "ACTIVE" })
      .andWhere("user.deletedAt IS NULL");

    if (tenantId) query.andWhere("user.tenantId = :tenantId", { tenantId });
    return query.getOne();
  }

  async findById(id: string): Promise<RetailUser | null> {
    return DatabaseConfig.getRepository(RetailUser)
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .andWhere("user.status = :status", { status: "ACTIVE" })
      .andWhere("user.deletedAt IS NULL")
      .getOne();
  }
}
