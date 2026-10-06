import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { BaseEntity } from "../BaseEntity";
import { BaseRepository } from "../BaseRepository";

class TestEntity extends BaseEntity {}

class TestRepository extends BaseRepository<TestEntity> {
  protected entityClass = TestEntity;
  protected selectedFields = {};
  protected relations = {};
  protected multipleFile = true;
}

describe("BaseRepository transaction manager", () => {
  it("dùng cùng manager cho truy vấn file phát sinh sau update", async () => {
    const updatedEntity = Object.assign(new TestEntity(), { id: "entity-1" });
    const queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 0 }),
    };
    const entityRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findOne: jest.fn().mockResolvedValue(updatedEntity),
    };
    const fileRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      find: jest.fn().mockResolvedValue([]),
    };
    const dataSource = {
      isInitialized: true,
      getRepository: jest.fn().mockReturnValue(entityRepository),
    };
    const manager = {
      getRepository: jest.fn((target: unknown) =>
        target === "File" ? fileRepository : entityRepository,
      ),
    };
    const repository = new TestRepository();
    repository.setDataSource(dataSource as any);
    dataSource.getRepository.mockClear();

    await repository.update(
      "entity-1",
      { updatedAt: new Date() },
      manager as any,
    );

    expect(manager.getRepository).toHaveBeenCalledWith("File");
    expect(fileRepository.find).toHaveBeenCalled();
    expect(dataSource.getRepository).not.toHaveBeenCalled();
  });
});
