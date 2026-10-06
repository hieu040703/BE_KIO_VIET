import "reflect-metadata";

import { Brackets } from "typeorm";
import { OrderRepository } from "../order.repository";
import { UserRoleEnum } from "@/shared/constants/constance";

const createRepository = (branch: { id: string } | null = null) => {
  const repository = Object.create(OrderRepository.prototype) as any;
  const queryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
  };

  repository.userRepository = {
    findByOption: jest.fn().mockResolvedValue({
      employeeId: "employee-1",
      role: UserRoleEnum.EMPLOYEE,
    }),
  };
  repository.branchRepository = {
    findByOption: jest.fn().mockResolvedValue(branch),
  };

  return { repository, queryBuilder };
};

const getVisibilityBrackets = (queryBuilder: { andWhere: jest.Mock }) => {
  const [condition] = queryBuilder.andWhere.mock.calls.find(([value]) => value instanceof Brackets) || [];
  return condition as Brackets;
};

describe("OrderRepository visibility", () => {
  it("allows the order creator or an assigned employee to see the order", async () => {
    const { repository, queryBuilder } = createRepository();

    await repository.extendQueryBuilder(queryBuilder, {}, { user: { userId: "user-1" } });

    const scope = getVisibilityBrackets(queryBuilder);
    const scopeQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
    };

    scope.whereFactory(scopeQueryBuilder as any);

    expect(scopeQueryBuilder.where).toHaveBeenCalledWith(
      "entity.createdByEmployeeId = :employeeId",
      { employeeId: "employee-1" },
    );
    expect(scopeQueryBuilder.orWhere).toHaveBeenCalledWith(
      expect.stringContaining("FROM order_employees oe"),
      { employeeId: "employee-1" },
    );
  });

  it("includes both field leaders and operational managers for a branch manager", async () => {
    const { repository, queryBuilder } = createRepository({ id: "branch-1" });

    await repository.extendQueryBuilder(queryBuilder, {}, { user: { userId: "user-1" } });

    const scope = getVisibilityBrackets(queryBuilder);
    const scopeQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
    };

    scope.whereFactory(scopeQueryBuilder as any);

    expect(scopeQueryBuilder.where).toHaveBeenCalledWith(
      "entity.createdByEmployeeId = :employeeId",
      { employeeId: "employee-1" },
    );
    expect(scopeQueryBuilder.orWhere).toHaveBeenCalledWith(
      expect.stringContaining("FROM order_employees oe"),
      { employeeId: "employee-1", branchId: "branch-1" },
    );
  });

  it("does not restrict admins to orders they created", async () => {
    const { repository, queryBuilder } = createRepository();
    repository.userRepository.findByOption.mockResolvedValue({
      employeeId: "employee-1",
      role: UserRoleEnum.ADMIN,
    });

    await repository.extendQueryBuilder(queryBuilder, {}, { user: { userId: "user-1" } });

    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(expect.any(Brackets));
  });
});
