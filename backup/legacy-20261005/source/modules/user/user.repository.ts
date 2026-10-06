import { BaseRepository } from "@/shared/base/BaseRepository";
import { User } from "@/database/models/User";
import { FindOptionsSelect, In, IsNull, Not, SelectQueryBuilder } from "typeorm";
import { UserSelectFull, UserRelations } from "./user.select";
import { UserRoleEnum } from "@/shared/constants/constance";
import { IFindOptions } from "@/shared/types/interfaces";

export class UserRepository extends BaseRepository<User> {
  protected entityClass = User;
  protected selectedFields = UserSelectFull;
  protected relations = UserRelations;

  constructor() {
    super();
  }

  setOptions(selectedFields?: FindOptionsSelect<User> | undefined): void {
    this.selectedFields = selectedFields || UserSelectFull;
    this.relations = UserRelations;
  }

  async findUserByDriverId(driverId: string): Promise<User | null> {
    return await this.findByOption({
      where: {
        // driverId: driverId,
      },
    });
  }

  async lockUserByDriverId(driverId: string): Promise<boolean> {
    const user = await this.findUserByDriverId(driverId);
    if (!user) {
      return false;
    }

    await this.update(user.id, {
      isActive: false,
    });

    return true;
  }

  async unlockUserByDriverId(driverId: string): Promise<boolean> {
    const user = await this.findUserByDriverId(driverId);
    if (!user) {
      return false;
    }

    await this.update(user.id, {
      isActive: true,
    });

    return true;
  }

  async getEmployeeByUserId(userId: string): Promise<string | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }
    return user.employeeId;
  }

  async findAdminUser(): Promise<User | null> {
    return await this.findByOption({
      where: {
        role: UserRoleEnum.ADMIN,
      },
    });
  }

  async findUserIdByCustomerId(customerId: string): Promise<string | null> {
    const user = await this.getRepository().findOne({
      where: { customerId },
      select: { id: true },
    });
    return user?.id || null;
  }

  async findAllAdminAndManagerUserIds(): Promise<string[]> {
    const users = await this.getRepository().find({
      where: [{ role: UserRoleEnum.ADMIN }, { role: UserRoleEnum.MANAGER }],
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async findAllAdminUserIds(): Promise<string[]> {
    const users = await this.getRepository().find({
      where: { role: UserRoleEnum.ADMIN },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async findUserIdsByEmployeeIds(employeeIds: string[]): Promise<string[]> {
    if (employeeIds.length === 0) return [];
    const users = await this.getRepository().find({
      where: { employeeId: In(employeeIds) },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  async findAllCustomerUserIds(): Promise<string[]> {
    const users = await this.getRepository().find({
      select: { id: true },
      where: { customerId: Not(IsNull()) },
      withDeleted: false,
    });
    return users.map((u) => u.id);
  }

  protected async extendQueryBuilder(qb: SelectQueryBuilder<User>, options: IFindOptions<User>): Promise<void> {
    const userType = options.moreQuery?.userType as string | undefined;

    console.log("userType", userType);
    if (userType === "system") {
      qb.andWhere("entity.employeeId IS NOT NULL");
    } else if (userType === "customer") {
      qb.andWhere("entity.customerId IS NOT NULL");
    }
  }
}
