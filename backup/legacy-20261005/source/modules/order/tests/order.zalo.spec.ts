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

import { Order } from "@/database/models/Order";
import { OrderStatusEnum } from "@/shared/constants/constance";
import { ZaloTemplateTypeEnum } from "../../zalo/zalo.constance";
import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";

const createService = (order: Partial<Order> | null) => {
  const findOne = jest.fn().mockResolvedValue(order);
  const sendMessage = jest.fn().mockResolvedValue({ error: 0 });
  const service = Object.create(OrderService.prototype) as OrderService;

  Object.assign(service as any, {
    orderRepository: {
      getRepository: jest.fn().mockReturnValue({ findOne }),
    },
    zaloService: { sendMessage },
  });

  return { service, findOne, sendMessage };
};

describe("OrderService Zalo notifications", () => {
  it("sends the CREATE template to the customer after an order is created", async () => {
    const order = {
      id: "order-1",
      code: "HD001",
      customerId: "customer-1",
      timeAt: new Date("2026-08-21T03:00:00.000Z"),
      address: {
        country: "Việt Nam",
        state: "Hà Nội",
        ward: "Bồ Đề",
        detail: "562 Nguyễn Văn Cừ",
      },
      status: OrderStatusEnum.PENDING,
      amount: 1_500_000,
      employeeCount: 2,
      description: "Giao trong giờ hành chính",
      customer: {
        name: "Nguyễn Văn A",
        phone: "0901234567",
      },
    } as Partial<Order>;
    const { service, findOne, sendMessage } = createService(order);

    await service.notifyOrderCreatedViaZalo("order-1");

    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        relations: { customer: true },
      }),
    );
    expect(sendMessage).toHaveBeenCalledWith(
      {
        phone: "84901234567",
        templateType: ZaloTemplateTypeEnum.CREATE,
        template_id: "",
        template_data: {
          name: "Nguyễn Văn A",
          phone: "0901234567",
          code: "HD001",
          address: "562 Nguyễn Văn Cừ, Bồ Đề, Hà Nội, Việt Nam",
          date: "10:00:00 21/08/2026",
          status: OrderStatusEnum.PENDING,
          price: 1_500_000,
          employee_count: 2,
          note: "Giao trong giờ hành chính",
          stringee: expect.any(String),
        },
      },
      { orderId: "order-1", customerId: "customer-1" },
    );
  });

  it("sends the COMPLETE template to the customer after an order is completed", async () => {
    const order = {
      id: "order-1",
      code: "HD001",
      customerId: "customer-1",
      status: OrderStatusEnum.COMPLETED,
      customer: {
        name: "Nguyễn Văn A",
        phone: "0901234567",
      },
    } as Partial<Order>;
    const { service, sendMessage } = createService(order);

    await service.notifyOrderCompletedViaZalo("order-1");

    expect(sendMessage).toHaveBeenCalledWith(
      {
        phone: "84901234567",
        templateType: ZaloTemplateTypeEnum.COMPLETE_AND_VOTE,
        template_id: "",
        template_data: {
          customer_name: "Nguyễn Văn A",
          order_code: "HD001",
          order_date: expect.any(String),
        },
      },
      { orderId: "order-1", customerId: "customer-1" },
    );
  });

  it("uses the order phone when it differs from the customer profile", async () => {
    const order = {
      id: "order-1",
      code: "HD001",
      customerId: "customer-1",
      timeAt: new Date("2026-08-21T03:00:00.000Z"),
      address: {},
      status: OrderStatusEnum.PENDING,
      customerPhone: "0987654321",
      customer: {
        name: "Nguyễn Văn A",
        phone: "0901234567",
      },
    } as Partial<Order>;
    const { service, sendMessage } = createService(order);

    await service.notifyOrderCreatedViaZalo("order-1");

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: "84987654321",
        template_data: expect.objectContaining({ phone: "0987654321" }),
      }),
      expect.anything(),
    );
  });

  it("skips Zalo when the order customer has no phone number", async () => {
    const { service, sendMessage } = createService({
      id: "order-1",
      customer: { name: "Nguyễn Văn A", phone: "" } as any,
    });

    await service.notifyOrderCreatedViaZalo("order-1");

    expect(sendMessage).not.toHaveBeenCalled();
  });
});

describe("OrderController.create Zalo side effect", () => {
  it("sends the Zalo notification after commit without failing a successful order creation", async () => {
    let committed = false;
    const result = {
      statusCode: 201,
      success: true,
      message: "OK",
      data: { id: "order-1", employeeId: null },
    };
    const service = {
      create: jest.fn().mockResolvedValue(result),
      notifyOrderCreatedViaZalo: jest.fn().mockImplementation(async () => {
        expect(committed).toBe(true);
        throw new Error("zalo unavailable");
      }),
    } as any;
    const transactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        const transactionResult = await callback({ manager: {} });
        committed = true;
        return transactionResult;
      }),
    } as any;
    const goongMapService = { notifyOrderAssigned: jest.fn() } as any;
    const response = {
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);
    const controller = new OrderController(
      service,
      transactionManager,
      goongMapService,
    );
    const next = jest.fn();

    await controller.create({ body: {} } as any, response as any, next);

    expect(service.notifyOrderCreatedViaZalo).toHaveBeenCalledWith("order-1");
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns the created order without waiting for the Zalo notification", async () => {
    let resolveZalo!: () => void;
    const zaloPending = new Promise<void>((resolve) => {
      resolveZalo = resolve;
    });
    const result = {
      statusCode: 201,
      success: true,
      message: "OK",
      data: { id: "order-1", employeeId: null },
    };
    const service = {
      create: jest.fn().mockResolvedValue(result),
      notifyOrderCreatedViaZalo: jest.fn().mockReturnValue(zaloPending),
    } as any;
    const transactionManager = {
      withTransaction: jest
        .fn()
        .mockImplementation(async (callback) => callback({ manager: {} })),
    } as any;
    const goongMapService = { notifyOrderAssigned: jest.fn() } as any;
    const response = {
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);
    const controller = new OrderController(
      service,
      transactionManager,
      goongMapService,
    );

    await controller.create({ body: {} } as any, response as any, jest.fn());

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
    expect(service.notifyOrderCreatedViaZalo).toHaveBeenCalledWith("order-1");

    resolveZalo();
    await zaloPending;
  });
});
