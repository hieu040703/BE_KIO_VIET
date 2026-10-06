import { RewardPoint } from "@/database/models/RewardPoint";
import { Vouchers } from "@/database/models/Vouchers";
import { BaseService } from "@/shared/base/BaseService";
import { RewardPointTypeEnum, VouchersTemplateStatusEnum } from "@/shared/constants/constance";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/shared/types/errors";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { inject, injectable } from "inversify";
import { REWARD_POINT_TYPES } from "../rewardPoint/rewardPoint.types";
import { AdminRewardPointRepository } from "../rewardPoint/admin.rewardPoint.repository";
import { VOUCHERS_TEMPLATE_TYPES } from "../vouchersTemplate/vouchersTemplate.types";
import { VouchersTemplateRepository } from "../vouchersTemplate/vouchersTemplate.repository";
import { VouchersRelations, VouchersSelectFull } from "./vouchers.select";
import { VOUCHERS_TYPES } from "./vouchers.types";
import { RedeemVoucherDto } from "./vouchers.validator";
import { VouchersRepository } from "./vouchers.repository";

@injectable()
export class ClientVouchersService extends BaseService<Vouchers> {
  protected relations = VouchersRelations;
  protected selectedFields = VouchersSelectFull;
  protected selectedFieldsForList = VouchersSelectFull;

  constructor(
    @inject(VOUCHERS_TYPES.VouchersRepository)
    private vouchersRepository: VouchersRepository,
    @inject(VOUCHERS_TEMPLATE_TYPES.VouchersTemplateRepository)
    private vouchersTemplateRepository: VouchersTemplateRepository,
    @inject(REWARD_POINT_TYPES.AdminRewardPointRepository)
    private rewardPointRepository: AdminRewardPointRepository,
  ) {
    super(vouchersRepository);
  }

  async validateBeforeQuery(options: IFindOptions<Vouchers>, req?: Request): Promise<void> {
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    }
    (options as any).customerId = customerId;
  }

  async findById(id: string, req?: Request, manager?: IEntityManager) {
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    }

    const voucher = await this.vouchersRepository.findById(id, manager);
    if (!voucher) {
      throw new NotFoundError("Không tìm thấy phiếu giảm giá");
    }
    if (voucher.customerId !== customerId) {
      throw new BadRequestError("Bạn không có quyền xem phiếu giảm giá này");
    }

    return super.findById(id, req, manager);
  }

  async create(data: RedeemVoucherDto, req?: Request, manager?: IEntityManager) {
    const userId = req?.user?.userId;
    const customerId = req?.user?.customerId;
    if (!userId || !customerId) {
      throw new UnauthorizedError("Bạn chưa đăng nhập với tài khoản khách hàng");
    }

    const template = await this.vouchersTemplateRepository
      .getRepository(manager)
      .createQueryBuilder("template")
      .setLock("pessimistic_read")
      .where("template.id = :id", { id: data.vouchersTemplateId })
      .andWhere("template.deletedAt IS NULL")
      .getOne();

    if (!template) {
      throw new NotFoundError("Không tìm thấy mẫu phiếu giảm giá");
    }
    if (template.status !== VouchersTemplateStatusEnum.ACTIVE) {
      throw new BadRequestError("Mẫu phiếu giảm giá không còn hoạt động");
    }

    const balance = await this.getRewardPointBalance(customerId, manager);
    if (balance < template.points) {
      throw new BadRequestError("Số điểm thưởng không đủ để quy đổi phiếu giảm giá");
    }

    const redeemedAt = new Date();
    const expiredAt = new Date(redeemedAt);
    expiredAt.setMonth(expiredAt.getMonth() + 12);
    const code = await this.generateVoucherCode(manager);

    const result = await super.create(
      {
        userId,
        customerId,
        vouchersTemplateId: template.id,
        code,
        redeemedAt,
        expiredAt,
        isUsed: false,
        note: data.note,
      },
      req,
      manager,
    );

    await this.rewardPointRepository.create(
      {
        customerId,
        orderId: null,
        points: template.points,
        type: RewardPointTypeEnum.REDEEMED,
        note: `Quy đổi phiếu giảm giá ${code}`,
      } as Partial<RewardPoint>,
      manager,
    );

    return result;
  }

  private async getRewardPointBalance(customerId: string, manager?: IEntityManager): Promise<number> {
    const raw = await this.rewardPointRepository
      .getRepository(manager)
      .createQueryBuilder("rewardPoint")
      .select(
        `COALESCE(SUM(CASE WHEN "rewardPoint"."type" = :earned THEN "rewardPoint"."points" ELSE -"rewardPoint"."points" END), 0)`,
        "balance",
      )
      .where("rewardPoint.customerId = :customerId", { customerId })
      .andWhere("rewardPoint.deletedAt IS NULL")
      .setParameters({ earned: RewardPointTypeEnum.EARNED })
      .getRawOne<{ balance: string | number }>();

    return Number(raw?.balance || 0);
  }

  private async generateVoucherCode(manager?: IEntityManager): Promise<string> {
    for (let i = 0; i < 5; i += 1) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `VC${Date.now().toString(36).toUpperCase()}${suffix}`;
      const exists = await this.vouchersRepository.fieldExists("code", code, manager);
      if (!exists) return code;
    }

    throw new BadRequestError("Không thể tạo mã phiếu giảm giá, vui lòng thử lại");
  }
}
