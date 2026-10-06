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

import { UserRoleEnum } from "@/shared/constants/constance";
import { EmployeeTicketParticipantService } from "../employeeTicketParticipant.service";

const createAdminRequest = () =>
  ({
    user: {
      userId: "admin-1",
      role: UserRoleEnum.ADMIN,
    },
  }) as any;

const createTicket = () => ({
  id: "ticket-1",
  createdByUserId: "creator-1",
  issue: "Cần hỗ trợ thiết bị",
});

describe("EmployeeTicketParticipantService", () => {
  it("adds only new participants and notifies only newly added users", async () => {
    const participantRepository = {
      findActiveByTicketAndUserIds: jest
        .fn()
        .mockResolvedValue([{ id: "participant-1", userId: "user-1" }]),
      createMany: jest.fn().mockResolvedValue([]),
      findActiveByTicketId: jest.fn().mockResolvedValue([]),
    };
    const ticketRepository = {
      findById: jest.fn().mockResolvedValue(createTicket()),
    };
    const userRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "admin-1",
        role: UserRoleEnum.ADMIN,
        isActive: true,
      }),
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([{ id: "user-1" }, { id: "user-2" }]),
      }),
    };
    const notificationService = {
      createNotificationForMultipleUsers: jest
        .fn()
        .mockResolvedValue(undefined),
    };
    const transactionManager = {
      withTransaction: jest.fn(
        async (callback: (tx: { manager: object }) => Promise<unknown>) =>
          callback({ manager: {} }),
      ),
    };
    const service = new EmployeeTicketParticipantService(
      participantRepository as any,
      ticketRepository as any,
      userRepository as any,
      transactionManager as any,
      notificationService as any,
    );

    const response = await service.add(
      "ticket-1",
      ["user-1", "user-1", "user-2"],
      createAdminRequest(),
    );

    expect(participantRepository.createMany).toHaveBeenCalledWith(
      [
        {
          employeeTicketId: "ticket-1",
          userId: "user-2",
          addedByUserId: "admin-1",
          removedByUserId: null,
        },
      ],
      expect.any(Object),
    );
    expect(
      notificationService.createNotificationForMultipleUsers,
    ).toHaveBeenCalledWith(
      ["user-2"],
      expect.objectContaining({ objectId: "ticket-1" }),
      expect.any(Object),
    );
    expect(response.statusCode).toBe(201);
  });

  it("rejects an invalid user without creating a partial batch", async () => {
    const participantRepository = {
      createMany: jest.fn(),
    };
    const ticketRepository = {
      findById: jest.fn().mockResolvedValue(createTicket()),
    };
    const userRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "admin-1",
        role: UserRoleEnum.ADMIN,
        isActive: true,
      }),
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([{ id: "user-1" }]),
      }),
    };
    const transactionManager = {
      withTransaction: jest.fn(
        async (callback: (tx: { manager: object }) => Promise<unknown>) =>
          callback({ manager: {} }),
      ),
    };
    const service = new EmployeeTicketParticipantService(
      participantRepository as any,
      ticketRepository as any,
      userRepository as any,
      transactionManager as any,
      {} as any,
    );

    await expect(
      service.add("ticket-1", ["user-1", "invalid-user"], createAdminRequest()),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Danh sách người tham gia không hợp lệ",
    });
    expect(participantRepository.createMany).not.toHaveBeenCalled();
  });

  it("soft-deletes a participant with the admin actor", async () => {
    const participantRepository = {
      softDeleteByTicketAndUser: jest.fn().mockResolvedValue(true),
    };
    const ticketRepository = {
      findById: jest.fn().mockResolvedValue(createTicket()),
    };
    const userRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "admin-1",
        role: UserRoleEnum.ADMIN,
        isActive: true,
      }),
    };
    const transactionManager = {
      withTransaction: jest.fn(
        async (callback: (tx: { manager: object }) => Promise<unknown>) =>
          callback({ manager: {} }),
      ),
    };
    const service = new EmployeeTicketParticipantService(
      participantRepository as any,
      ticketRepository as any,
      userRepository as any,
      transactionManager as any,
      {} as any,
    );

    const response = await service.remove(
      "ticket-1",
      "user-2",
      createAdminRequest(),
    );

    expect(
      participantRepository.softDeleteByTicketAndUser,
    ).toHaveBeenCalledWith("ticket-1", "user-2", "admin-1", expect.any(Object));
    expect(response.statusCode).toBe(200);
  });

  it("does not allow a manager to add participants in the MVP", async () => {
    const service = new EmployeeTicketParticipantService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const managerRequest = {
      user: {
        userId: "manager-1",
        role: UserRoleEnum.MANAGER,
      },
    } as any;

    await expect(
      service.add("ticket-1", ["user-2"], managerRequest),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Chỉ quản trị viên mới được quản lý người tham gia ticket",
    });
  });
});
