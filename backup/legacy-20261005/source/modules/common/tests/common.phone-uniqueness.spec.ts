import { validateUniquePhone } from "../phone-uniqueness";

const createRepositories = (employeeCount: number, customerCount: number) => {
  const employeeRepository = {
    count: jest.fn().mockResolvedValue(employeeCount),
  };
  const customerRepository = {
    count: jest.fn().mockResolvedValue(customerCount),
  };
  return { employeeRepository, customerRepository };
};

describe("validateUniquePhone", () => {
  it("rejects an employee phone already used by a customer", async () => {
    const { employeeRepository, customerRepository } = createRepositories(0, 1);

    await expect(
      validateUniquePhone("0900000000", "employee", undefined, undefined, employeeRepository, customerRepository),
    ).rejects.toThrow("Số điện thoại đã được sử dụng");
  });

  it("rejects a customer phone already used by an employee", async () => {
    const { employeeRepository, customerRepository } = createRepositories(1, 0);

    await expect(
      validateUniquePhone("0900000000", "customer", undefined, undefined, employeeRepository, customerRepository),
    ).rejects.toThrow("Số điện thoại đã được sử dụng");
  });

  it("rejects a duplicate phone in the same entity type", async () => {
    const { employeeRepository, customerRepository } = createRepositories(1, 0);

    await expect(
      validateUniquePhone("0900000000", "employee", undefined, undefined, employeeRepository, customerRepository),
    ).rejects.toThrow("Số điện thoại đã được sử dụng");
  });

  it("passes the transaction manager and excludes the current record on update", async () => {
    const { employeeRepository, customerRepository } = createRepositories(0, 0);
    const manager = {} as any;

    await expect(
      validateUniquePhone(
        "+84900000000",
        "employee",
        "employee-1",
        manager,
        employeeRepository,
        customerRepository,
      ),
    ).resolves.toBeUndefined();

    expect(employeeRepository.count).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.any(Object) }),
      manager,
    );
    expect(customerRepository.count).toHaveBeenCalledWith(expect.any(Object), manager);
  });

  it("checks local and international representations of the same phone", async () => {
    const { employeeRepository, customerRepository } = createRepositories(0, 0);

    await validateUniquePhone(
      "0900000000",
      "employee",
      undefined,
      undefined,
      employeeRepository,
      customerRepository,
    );

    const phoneFilter = (customerRepository.count as jest.Mock).mock.calls[0][0].phone;
    expect(phoneFilter.value).toEqual(
      expect.arrayContaining(["0900000000", "84900000000", "+84900000000"]),
    );
  });

  it("skips empty phones", async () => {
    const { employeeRepository, customerRepository } = createRepositories(1, 1);

    await expect(
      validateUniquePhone(
        "  ",
        "employee",
        undefined,
        undefined,
        employeeRepository,
        customerRepository,
      ),
    ).resolves.toBeUndefined();

    expect(employeeRepository.count).not.toHaveBeenCalled();
    expect(customerRepository.count).not.toHaveBeenCalled();
  });
});
