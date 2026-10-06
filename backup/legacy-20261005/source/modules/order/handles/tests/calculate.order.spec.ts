import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: {
    get: jest.fn(),
  },
}));

import { container } from "@/modules/container";
import { FINANCE_TYPES } from "@/modules/accountant/finance/finance.types";
import { DEBT_TYPES } from "@/modules/accountant/debt/debt.types";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import {
  OrderStatusEnum,
  OtherAmountTypeEnum,
  PositionDefaultEnum,
  TimeKeepingTypeEnum,
} from "@/shared/constants/constance";
import { ORDER_LEADER_TYPES } from "../../orderLeader/orderLeader.types";
import { ORDER_TYPES } from "../../order.types";
import { CalculateOrderData } from "../calculate.order";

describe("CalculateOrderData.process", () => {
  const manager = {} as any;

  const setup = (
    deposit = 0,
    finances: Array<{ id: string; isDeposit: boolean }> = [],
    options: {
      status?: OrderStatusEnum;
      hasAllocatedRevenue?: boolean;
      allocateRevenuePercent?: number | null;
      timeKeeping?: { id: string; employeeId?: string; otherAmount: number | null } | null;
      orderLeader?: { id: string; employeeId: string } | null;
      referrerId?: string | null;
      referrerPercent?: number | null;
      isReferrerPaid?: boolean;
      createdByEmployeeId?: string | null;
      createdByEmployeePercent?: number | null;
      isPaidForEmployeeCreateOrder?: boolean;
      timeKeepings?: Partial<
        Record<
          OtherAmountTypeEnum,
          { id: string; employeeId?: string; otherAmount: number | null; isPaid?: boolean } | null
        >
      >;
    } = {},
  ) => {
    const findOrder = jest.fn().mockResolvedValue({
      id: "order-1",
      code: "HD001",
      branchId: "branch-1",
      customerId: "customer-1",
      timeAt: new Date("2026-08-06T03:00:00.000Z"),
      discountPercent: 10,
      vat: 8,
      isPaid: true,
      status: options.status ?? OrderStatusEnum.PROCESSING,
      deposit,
      amount: 145_800,
      allocateRevenuePercent: options.allocateRevenuePercent === undefined ? 10 : options.allocateRevenuePercent,
      hasAllocatedRevenue: options.hasAllocatedRevenue ?? false,
      referrerId: options.referrerId ?? null,
      referrerPercent: options.referrerPercent ?? null,
      isReferrerPaid: options.isReferrerPaid ?? false,
      createdByEmployeeId: options.createdByEmployeeId ?? null,
      createdByEmployeePercent: options.createdByEmployeePercent ?? null,
      isPaidForEmployeeCreateOrder: options.isPaidForEmployeeCreateOrder ?? false,
      details: [{ amount: 100_000 }, { amount: 50_000 }],
    });
    const findFinances = jest.fn().mockResolvedValue(finances);
    const findDepositFinance = jest
      .fn()
      .mockResolvedValue(finances.find((finance) => finance.isDeposit) ?? null);
    const updateRelatedFinances = jest.fn();
    const updateOrderDirectly = jest.fn();
    const incrementCalculationVersion = jest.fn();

    const orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        findOne: findOrder,
        update: updateOrderDirectly,
        increment: incrementCalculationVersion,
      }),
      findById: jest.fn(),
      getTotalIncomeByOrderId: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
    };
    const debtRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const financeRepository = {
      getRepository: jest.fn().mockReturnValue({
        find: findFinances,
        findOne: findDepositFinance,
        update: updateRelatedFinances,
      }),
      findByOptions: jest.fn().mockResolvedValue(finances),
      update: jest.fn(),
    };
    const financeService = { create: jest.fn(), update: jest.fn() };
    const debtService = { create: jest.fn() };
    const orderLeaderService = {
      redistributeOrderLeaderRevenueShare: jest.fn(),
    };
    const orderLeaderRepository = {
      findByOption: jest.fn().mockResolvedValue(
        options.orderLeader === undefined
          ? { id: "leader-1", employeeId: "manager-1" }
          : options.orderLeader,
      ),
    };
    const timeKeepingRepository = {
      findOne: jest.fn().mockImplementation((where: { otherAmountType?: OtherAmountTypeEnum }) => {
        if (options.timeKeepings) {
          return Promise.resolve(options.timeKeepings[where.otherAmountType!]);
        }

        return Promise.resolve(options.timeKeeping ?? null);
      }),
      create: jest.fn(),
      update: jest.fn(),
    };

    const dependencies = new Map<symbol, unknown>([
      [ORDER_TYPES.OrderRepository, orderRepository],
      [DEBT_TYPES.DebtRepository, debtRepository],
      [FINANCE_TYPES.FinanceRepository, financeRepository],
      [FINANCE_TYPES.FinanceService, financeService],
      [DEBT_TYPES.DebtService, debtService],
      [ORDER_LEADER_TYPES.OrderLeaderService, orderLeaderService],
      [ORDER_LEADER_TYPES.OrderLeaderRepository, orderLeaderRepository],
      [TIME_KEEPING_TYPES.TimeKeepingRepository, timeKeepingRepository],
    ]);

    (container.get as jest.Mock).mockImplementation((type: symbol) =>
      dependencies.get(type),
    );

    return {
      findOrder,
      findFinances,
      findDepositFinance,
      updateRelatedFinances,
      updateOrderDirectly,
      incrementCalculationVersion,
      debtRepository,
      orderRepository,
      financeRepository,
      financeService,
      orderLeaderService,
      orderLeaderRepository,
      timeKeepingRepository,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tính tổng đồng bộ rồi chỉ đánh dấu phiên bản cần xử lý nền", async () => {
    const mocks = setup();

    await new CalculateOrderData().process("order-1", manager);

    expect(mocks.findOrder).toHaveBeenCalledWith({
      where: { id: "order-1" },
      select: {
        id: true,
        code: true,
        branchId: true,
        customerId: true,
        timeAt: true,
        discountPercent: true,
        vat: true,
        isPaid: true,
        status: true,
        deposit: true,
        details: true,
      },
      loadEagerRelations: false,
      relations: { details: true },
    });
    expect(mocks.orderRepository.findById).not.toHaveBeenCalled();
    expect(mocks.updateOrderDirectly).toHaveBeenCalledWith(
      "order-1",
      {
        preVatAmount: 150_000,
        discountAmount: 15_000,
        vatAmount: 10_800,
        amount: 145_800,
        isPaid: false,
      },
    );
    expect(mocks.orderRepository.update).not.toHaveBeenCalled();
    expect(mocks.incrementCalculationVersion).toHaveBeenCalledWith(
      { id: "order-1" },
      "calculationVersion",
      1,
    );
    expect(mocks.debtRepository.findOne).not.toHaveBeenCalled();
    expect(mocks.updateRelatedFinances).not.toHaveBeenCalled();
    expect(mocks.findDepositFinance).not.toHaveBeenCalled();
  });

  it("xử lý công nợ, finance và phân bổ doanh thu trong nhánh chạy nền", async () => {
    const mocks = setup(50_000, [{ id: "finance-1", isDeposit: true }]);

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.debtRepository.findOne).toHaveBeenCalledWith(
      { orderId: "order-1" },
      manager,
    );
    expect(mocks.updateRelatedFinances).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        deletedAt: expect.anything(),
      }),
      { customerId: "customer-1" },
    );
    expect(mocks.findDepositFinance).toHaveBeenCalledWith({
      where: { orderId: "order-1", isDeposit: true },
      select: { id: true, isDeposit: true },
      loadEagerRelations: false,
    });
    expect(mocks.findFinances).not.toHaveBeenCalled();
    expect(mocks.financeRepository.findByOptions).not.toHaveBeenCalled();
    expect(mocks.financeRepository.update).toHaveBeenCalledWith(
      "finance-1",
      { amount: 50_000, customerId: "customer-1" },
      manager,
    );
    expect(mocks.financeService.update).not.toHaveBeenCalled();
    expect(mocks.financeService.create).not.toHaveBeenCalled();
    expect(
      mocks.orderLeaderService.redistributeOrderLeaderRevenueShare,
    ).toHaveBeenCalledWith("order-1", 145_800, manager);
  });

  it("bỏ qua chia sẻ doanh thu nếu hợp đồng chưa hoàn thành", async () => {
    const mocks = setup(0, [], { status: OrderStatusEnum.PROCESSING });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.findOne).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.create).not.toHaveBeenCalled();
    expect(mocks.orderLeaderRepository.findByOption).not.toHaveBeenCalled();
    expect(mocks.orderRepository.update).not.toHaveBeenCalledWith(
      "order-1",
      { hasAllocatedRevenue: true },
      manager,
    );
  });

  it("tạo TimeKeeping chia sẻ doanh thu nhưng chưa đánh dấu order đã thanh toán", async () => {
    const mocks = setup(0, [], { status: OrderStatusEnum.COMPLETED });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.findOne).toHaveBeenCalledWith(
      {
        referrerOrderId: "order-1",
        otherAmountType: OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER,
      },
      manager,
    );
    expect(mocks.orderLeaderRepository.findByOption).toHaveBeenCalledWith(
      {
        where: {
          orderId: "order-1",
          position: PositionDefaultEnum.BRANCH_MANAGER,
        },
        select: { id: true, employeeId: true },
      },
      manager,
    );
    expect(mocks.timeKeepingRepository.create).toHaveBeenCalledWith(
      {
        employeeId: "manager-1",
        type: TimeKeepingTypeEnum.OUT,
        timeAt: new Date("2026-08-06T03:00:00.000Z"),
        otherAmount: 14_580,
        otherAmountType: OtherAmountTypeEnum.ALLOCATED_REVENUE_ORDER,
        referrerOrderId: "order-1",
        note: "Phân bổ doanh thu hợp đồng HD001",
      },
      manager,
    );
    expect(mocks.orderRepository.update).not.toHaveBeenCalledWith(
      "order-1",
      { hasAllocatedRevenue: true },
      manager,
    );
  });

  it("đồng bộ lại otherAmount khi TimeKeeping chia sẻ doanh thu đã tồn tại nhưng sai số tiền", async () => {
    const mocks = setup(0, [], {
      status: OrderStatusEnum.COMPLETED,
      timeKeeping: { id: "time-keeping-1", employeeId: "manager-1", otherAmount: 10_000 },
    });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.create).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.update).toHaveBeenCalledWith(
      "time-keeping-1",
      { otherAmount: 14_580 },
      manager,
    );
    expect(mocks.orderLeaderRepository.findByOption).toHaveBeenCalled();
    expect(mocks.orderRepository.update).not.toHaveBeenCalledWith(
      "order-1",
      { hasAllocatedRevenue: true },
      manager,
    );
  });

  it("bỏ qua toàn bộ đối soát khi order đã đánh dấu hasAllocatedRevenue", async () => {
    const mocks = setup(0, [], {
      status: OrderStatusEnum.COMPLETED,
      hasAllocatedRevenue: true,
    });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.findOne).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.create).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.update).not.toHaveBeenCalled();
    expect(mocks.orderLeaderRepository.findByOption).not.toHaveBeenCalled();
  });

  it("tạo thưởng cho nhân viên giới thiệu và nhân viên tạo đơn từ thông tin trên order", async () => {
    const mocks = setup(0, [], {
      status: OrderStatusEnum.COMPLETED,
      allocateRevenuePercent: null,
      referrerId: "referrer-1",
      referrerPercent: 5,
      createdByEmployeeId: "creator-1",
      createdByEmployeePercent: 8,
    });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.findOne).toHaveBeenCalledWith(
      {
        referrerOrderId: "order-1",
        otherAmountType: OtherAmountTypeEnum.REFERRER_ORDER,
      },
      manager,
    );
    expect(mocks.timeKeepingRepository.findOne).toHaveBeenCalledWith(
      {
        referrerOrderId: "order-1",
        otherAmountType: OtherAmountTypeEnum.CREATE_ORDER,
      },
      manager,
    );
    expect(mocks.timeKeepingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: "referrer-1",
        otherAmount: 7_290,
        otherAmountType: OtherAmountTypeEnum.REFERRER_ORDER,
        referrerOrderId: "order-1",
      }),
      manager,
    );
    expect(mocks.timeKeepingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: "creator-1",
        otherAmount: 11_664,
        otherAmountType: OtherAmountTypeEnum.CREATE_ORDER,
        referrerOrderId: "order-1",
      }),
      manager,
    );
    expect(mocks.orderRepository.update).not.toHaveBeenCalledWith("order-1", {
      isReferrerPaid: true,
    });
    expect(mocks.orderRepository.update).not.toHaveBeenCalledWith("order-1", {
      isPaidForEmployeeCreateOrder: true,
    });
  });

  it("cập nhật lại số tiền thưởng referral và tạo đơn khi TimeKeeping đã tồn tại", async () => {
    const mocks = setup(0, [], {
      status: OrderStatusEnum.COMPLETED,
      allocateRevenuePercent: null,
      referrerId: "referrer-1",
      referrerPercent: 5,
      createdByEmployeeId: "creator-1",
      createdByEmployeePercent: 8,
      timeKeepings: {
        [OtherAmountTypeEnum.REFERRER_ORDER]: {
          id: "referrer-tk",
          employeeId: "referrer-1",
          otherAmount: 1_000,
        },
        [OtherAmountTypeEnum.CREATE_ORDER]: {
          id: "creator-tk",
          employeeId: "creator-1",
          otherAmount: 2_000,
        },
      },
    });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.create).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.update).toHaveBeenCalledWith(
      "referrer-tk",
      { otherAmount: 7_290 },
      manager,
    );
    expect(mocks.timeKeepingRepository.update).toHaveBeenCalledWith(
      "creator-tk",
      { otherAmount: 11_664 },
      manager,
    );
  });

  it("bỏ qua thưởng referral và tạo đơn khi khoản tương ứng đã được thanh toán", async () => {
    const mocks = setup(0, [], {
      status: OrderStatusEnum.COMPLETED,
      allocateRevenuePercent: null,
      referrerId: "referrer-1",
      referrerPercent: 5,
      isReferrerPaid: true,
      createdByEmployeeId: "creator-1",
      createdByEmployeePercent: 8,
      isPaidForEmployeeCreateOrder: true,
    });

    await new CalculateOrderData().processRelatedData("order-1", manager);

    expect(mocks.timeKeepingRepository.findOne).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.create).not.toHaveBeenCalled();
    expect(mocks.timeKeepingRepository.update).not.toHaveBeenCalled();
  });
});
