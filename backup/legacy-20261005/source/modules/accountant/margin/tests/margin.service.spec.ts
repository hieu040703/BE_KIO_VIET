import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { MarginService } from "../margin.service";
import {
  MarginStatusEnum,
  MarginTypeEnum,
  OtherAmountTypeEnum,
  TimeKeepingTypeEnum,
} from "@/shared/constants/constance";

describe("MarginService.refundMargin", () => {
  it("marks margin approved and creates an OUT timekeeping at the requested time", async () => {
    const marginRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "margin-1",
        employeeId: "employee-1",
        amount: 1500000,
        type: MarginTypeEnum.MARGIN,
        status: null,
      }),
      update: jest.fn().mockResolvedValue({}),
      setOptions: jest.fn(),
      findOne: jest.fn(),
      fieldExists: jest.fn(),
    } as any;

    const refundedAt = new Date("2026-06-09T08:46:04.838Z");
    const timeKeepingRepository = {
      create: jest.fn().mockResolvedValue({}),
      findByOptions: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    } as any;

    const service = new MarginService(
      marginRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      timeKeepingRepository,
    );

    await service.refundMargin("margin-1", refundedAt, undefined, {} as any);

    expect(marginRepository.update).toHaveBeenCalledWith(
      "margin-1",
      { status: MarginStatusEnum.APPROVED },
      {} as any,
    );

    expect(timeKeepingRepository.create).toHaveBeenCalledWith(
      {
        type: TimeKeepingTypeEnum.OUT,
        employeeId: "employee-1",
        timeAt: refundedAt,
        otherAmount: 1500000,
        otherAmountType: OtherAmountTypeEnum.MARGIN,
        marginId: "margin-1",
        note: "Hoàn trả khoản ký quỹ cho nhân viên",
      },
      {} as any,
    );
  });
});
