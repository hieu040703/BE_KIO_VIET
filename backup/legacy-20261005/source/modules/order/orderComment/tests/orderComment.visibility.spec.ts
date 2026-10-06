import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  __esModule: true,
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
  },
}));

jest.mock("@/shared/utils/socket.utils", () => ({
  __esModule: true,
  SocketUtils: {
    getRoomMembers: jest.fn().mockResolvedValue([]),
    getUserSocket: jest.fn().mockReturnValue([]),
    broadcastToRoom: jest.fn(),
    sendSocketToUser: jest.fn(),
  },
}));

import { Request } from "express";
import { OrderCommentService } from "../orderComment.service";
import { UserRoleEnum } from "@/shared/constants/constance";

const createService = (timeAt: string, role: UserRoleEnum) => {
  const repository = {
    findWithPagination: jest.fn(async (options: any) => {
      const isEmptyQuery = Boolean(options.where?.id);

      return {
        data: isEmptyQuery ? [] : [{ id: "comment-1" }],
        total: isEmptyQuery ? 0 : 1,
      };
    }),
  };

  const service = Object.create(OrderCommentService.prototype) as OrderCommentService;
  Object.assign(service as any, {
    repository,
    orderRepository: {
      findById: jest.fn().mockResolvedValue({ timeAt }),
    },
  });

  const req = {
    user: { role },
    params: { orderId: "order-1" },
  } as unknown as Request;

  return { service, repository, req };
};

describe("OrderCommentService historical comment visibility", () => {
  it("returns an empty result for employees viewing an order before 04/09/2026", async () => {
    const { service, repository, req } = createService(
      "2026-09-03T23:59:59+07:00",
      UserRoleEnum.EMPLOYEE,
    );

    const response = await service.findAllWithPagination({ page: 1, size: 20 }, req);

    expect(response.data).toEqual([]);
    expect(response.pagination?.totalRecords).toBe(0);
    expect(repository.findWithPagination).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: expect.anything() }) }),
      undefined,
      false,
      req,
    );
  });

  it("keeps comments visible to employees from 04/09/2026 onward", async () => {
    const { service, req } = createService(
      "2026-09-04T00:00:00+07:00",
      UserRoleEnum.EMPLOYEE,
    );

    const response = await service.findAllWithPagination({ page: 1, size: 20 }, req);

    expect(response.data).toEqual([{ id: "comment-1" }]);
  });

  it("keeps historical comments visible to non-employees", async () => {
    const { service, req } = createService(
      "2026-09-03T23:59:59+07:00",
      UserRoleEnum.MANAGER,
    );

    const response = await service.findAllWithPagination({ page: 1, size: 20 }, req);

    expect(response.data).toEqual([{ id: "comment-1" }]);
  });
});
