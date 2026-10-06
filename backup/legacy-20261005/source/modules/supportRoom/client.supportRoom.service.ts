import { injectable, inject } from "inversify";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { SUPPORT_ROOM_TYPES } from "./supportRoom.types";
import { COMMON_TYPES } from "../common/common.types";
import { SupportRoom } from "@/database/models/SupportRoom";
import { User } from "@/database/models/User";
import { Customer } from "@/database/models/Customer";
import { IEntityManager } from "@/shared/types/interfaces";
import { NotFoundError, ForbiddenError } from "@/shared/types/errors";
import DatabaseConfig from "@/database/database";

@injectable()
export class ClientSupportRoomService {
  constructor(@inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager) {}

  private getSupportRoomRepo(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(SupportRoom);
  }

  private getUserRepo(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(User);
  }

  private getCustomerRepo(manager?: IEntityManager) {
    return (manager ?? DatabaseConfig).getRepository(Customer);
  }

  async getOrCreateMyRoom(userId: string, manager?: IEntityManager) {
    const user = await this.getUserRepo(manager).findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("Không tìm thấy người dùng");
    if (!user.customerId) throw new ForbiddenError("Tài khoản chưa liên kết với khách hàng");

    const customer = await this.getCustomerRepo(manager).findOne({ where: { id: user.customerId } });
    if (!customer) throw new NotFoundError("Không tìm thấy thông tin khách hàng");

    const roomRepo = this.getSupportRoomRepo(manager);
    let room = await roomRepo.findOne({
      where: { customerId: user.customerId },
      relations: { customer: true },
    });

    if (!room) {
      const newRoom = roomRepo.create({
        name: customer.name || customer.phone || "Khách hàng",
        customerId: user.customerId,
      });
      room = await roomRepo.save(newRoom);
      room = (await roomRepo.findOne({
        where: { id: room.id },
        relations: { customer: true },
      })) as SupportRoom;
    }

    return {
      statusCode: 200,
      success: true,
      message: "OK",
      data: room,
    };
  }

  async verifyRoomAccess(supportRoomId: string, userId: string, manager?: IEntityManager): Promise<SupportRoom> {
    const user = await this.getUserRepo(manager).findOne({ where: { id: userId } });
    if (!user || !user.customerId) throw new ForbiddenError("Bạn không có quyền truy cập phòng này");

    const room = await this.getSupportRoomRepo(manager).findOne({ where: { id: supportRoomId } });
    if (!room) throw new NotFoundError("Không tìm thấy phòng hỗ trợ");

    if (room.customerId !== user.customerId) throw new ForbiddenError("Bạn không có quyền truy cập phòng này");

    return room;
  }
}
