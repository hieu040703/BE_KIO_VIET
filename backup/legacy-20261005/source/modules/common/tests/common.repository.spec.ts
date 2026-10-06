import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { CommonRepository } from "../common.repository";

const createRepositoryMock = () => ({
  count: jest.fn().mockResolvedValue(0),
  countDistinct: jest.fn().mockResolvedValue(0),
  exists: jest.fn().mockResolvedValue(false),
});

describe("CommonRepository", () => {
  it("generates the next service order code", async () => {
    const financeRepository = createRepositoryMock();
    const userRepository = createRepositoryMock();
    const branchRepository = createRepositoryMock();
    const customerRepository = createRepositoryMock();
    const employeeRepository = createRepositoryMock();
    const orderRepository = createRepositoryMock();
    const transactionRepository = createRepositoryMock();
    const marginRepository = createRepositoryMock();
    const debtRepository = createRepositoryMock();
    const fundTransactionRepository = createRepositoryMock();
    const serviceOrderRepository = createRepositoryMock();

    serviceOrderRepository.count.mockResolvedValue(5);

    const repository = new (CommonRepository as any)(
      financeRepository,
      userRepository,
      branchRepository,
      customerRepository,
      employeeRepository,
      orderRepository,
      transactionRepository,
      marginRepository,
      debtRepository,
      fundTransactionRepository,
      serviceOrderRepository,
    ) as CommonRepository;

    const code = await repository.getCode("ServiceOrder" as any);

    expect(code).toBe("DV000006");
    expect(serviceOrderRepository.exists).toHaveBeenCalledWith({ code: "DV000006" }, undefined);
  });
});
