import { Vouchers } from "@/database/models/Vouchers";
import { BadRequestError, ForbiddenError } from "@/shared/types/errors";

type ResolveVoucherDiscountAmountInput = {
  voucher: Pick<Vouchers, "customerId" | "isUsed" | "expiredAt"> | null;
  customerId: string;
  templateAmount?: number | null;
  now?: Date;
};

export const resolveVoucherDiscountAmount = ({
  voucher,
  customerId,
  templateAmount,
  now = new Date(),
}: ResolveVoucherDiscountAmountInput): number => {
  if (!voucher) {
    throw new BadRequestError("Không tìm thấy phiếu giảm giá");
  }
  if (voucher.customerId !== customerId) {
    throw new ForbiddenError("Phiếu giảm giá không thuộc về khách hàng này");
  }
  if (voucher.isUsed) {
    throw new BadRequestError("Phiếu giảm giá đã được sử dụng");
  }
  if (voucher.expiredAt.getTime() < now.getTime()) {
    throw new BadRequestError("Phiếu giảm giá đã hết hạn");
  }

  return Number(templateAmount || 0);
};
