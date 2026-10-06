import "reflect-metadata";

import { EmployeeRepository } from "../employee.repository";
import { EmployeeStatusType, PositionDefaultEnum } from "@/shared/constants/constance";

type QueryBuilderStub = {
  expressionMap: {
    joinAttributes: unknown[];
    wheres: Array<{ condition: string }>;
  };
  conditions: string[];
  [key: string]: any;
};

const createQueryBuilderStub = (): QueryBuilderStub => {
  const queryBuilder = {
    expressionMap: {
      joinAttributes: [],
      wheres: [],
    },
    conditions: [],
  } as QueryBuilderStub;

  queryBuilder.select = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.leftJoin = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.addSelect = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.orderBy = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.offset = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.limit = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.getCount = jest.fn().mockResolvedValue(0);
  queryBuilder.getRawMany = jest.fn().mockResolvedValue([]);
  queryBuilder.andWhere = jest.fn((condition: string) => {
    if (condition.includes(" ILIKE ")) {
      throw new Error("operator does not exist: employees_position_enum ILIKE unknown");
    }

    queryBuilder.conditions.push(condition);
    queryBuilder.expressionMap.wheres.push({ condition });
    return queryBuilder;
  });
  queryBuilder.clone = jest.fn(() => {
    const clone = createQueryBuilderStub();
    clone.conditions = [...queryBuilder.conditions];
    clone.expressionMap.wheres = queryBuilder.expressionMap.wheres.map((where) => ({ ...where }));
    return clone;
  });

  return queryBuilder;
};

describe("EmployeeRepository position filter", () => {
  it("filters enum position without using PostgreSQL ILIKE", async () => {
    const queryBuilder = createQueryBuilderStub();
    const repository = Object.create(EmployeeRepository.prototype) as EmployeeRepository;
    const entityRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    jest.spyOn(repository as any, "getRepository").mockReturnValue(entityRepository);

    const result = await repository.findWithPagination({
      page: 1,
      size: 10,
      position: PositionDefaultEnum.LEADER,
      statuses: [EmployeeStatusType.ACTIVE, EmployeeStatusType.ON_LEAVE],
    } as any);

    expect(result.total).toBe(0);
    expect(queryBuilder.conditions).toContain("entity.position = :position");
  });

  it("uses the same enum-safe comparison in the shared query extension", async () => {
    const queryBuilder = createQueryBuilderStub();
    const repository = Object.create(EmployeeRepository.prototype) as EmployeeRepository;

    await (repository as any).extendQueryBuilder(queryBuilder, {
      position: PositionDefaultEnum.LEADER,
    });

    expect(queryBuilder.conditions).toContain("entity.position = :position");
  });
});
